// backend/services/message.service.js
import prisma from '../lib/prisma.js';
import { conversationService } from './conversation.service.js';
import { llmServicer, llmService } from './llm.service.js';
import { roleService } from './role.service.js';

export const messageService = {
  /**
   * Créer un message (utilisateur ou assistant)
   */
  async createMessage({
    conversationId,
    userId,
    content,
    role,
    model = null,
    tokens = null,
    attachments = [],
  }) {
    const message = await prisma.message.create({
      data: {
        content: content ?? '',
        role,
        conversationId,
        userId: role === 'user' ? userId : null,
        model,
        tokens,
        attachments: attachments.length > 0 ? attachments : null,
      },
    });

    // Mettre à jour le timestamp de la conversation
    await conversationService.touchConversation(conversationId);

    return message;
  },

  /**
   * ✅ CORRECTION MAJEURE : Envoyer un message utilisateur → générer la réponse IA
   * Gère l'injection du system prompt selon le rôle de la conversation
   */
  async sendMessage({
    conversationId,
    userId,
    content,
    attachments = [],
    selectedModel = 'gemini',
  }) {
    try {
      // 1. Vérifier que la conversation existe et appartient à l'utilisateur
      const conversation = await conversationService.getConversationById(conversationId, userId);
      if (!conversation) {
        throw new Error('Conversation non trouvée ou accès non autorisé');
      }

      // 2. Récupérer les messages existants EN PREMIER (avant de créer le nouveau)
      //    → nécessaire pour lire le system prompt et construire l'historique
      const existingMessages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        select: {
          role: true,
          content: true,
          attachments: true,
        },
      });

      // 3. ✅ CORRECTION : Extraire le system prompt ET filtrer l'historique
      let systemPrompt = null;
      let historyWithoutSystem = [];

      const firstMessage = existingMessages[0];
      if (firstMessage && firstMessage.role === 'system') {
        systemPrompt = firstMessage.content;
        // ✅ IMPORTANT : Ne pas inclure le message 'system' dans l'historique
        // car il sera passé séparément dans systemInstruction
        historyWithoutSystem = existingMessages.slice(1);
        console.log('[MessageService] ✅ System prompt trouvé:', systemPrompt.substring(0, 100) + '...');
      } else {
        historyWithoutSystem = existingMessages;
        console.log('[MessageService] ⚠️ Aucun message système trouvé');
      }

      // 4. Créer le message utilisateur en BDD
      const userMessage = await this.createMessage({
        conversationId,
        userId,
        content,
        role: 'user',
        attachments,
      });

      // 5. ✅ CORRECTION : Construire l'historique SANS le message system
      //    Le message system sera passé via systemInstruction
      const messages = [
        ...historyWithoutSystem,
        { role: 'user', content, attachments },
      ];

      // 6. Préparer le format attendu par le LLM (rôle + contenu uniquement)
      // ✅ IMPORTANT : Filtrer les messages 'system' de l'historique
      const history = messages
        .filter(msg => msg.role !== 'system') // Double sécurité
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      console.log('[MessageService] Historique envoyé au LLM:', history.length, 'messages');
      console.log('[MessageService] System prompt:', systemPrompt ? 'OUI' : 'NON');

      // 7. Générer un titre automatique si c'est le tout premier message utilisateur
      const userMessages = historyWithoutSystem.filter(m => m.role === 'user');
      if (userMessages.length === 0) {
        const title = await llmService.generateConversationTitle(content);
        await conversationService.updateConversationTitle(conversationId, userId, title);
      }

      // 8. Demander la réponse au LLM avec le system prompt
      const lastAttachments = attachments.length > 0 ? attachments : [];
      let llmResponse;

      if (selectedModel === 'gemini') {
        llmResponse = await llmServicer.generateResponse(
          content,
          history,
          lastAttachments,
          conversationId,
          systemPrompt // ✅ Le system prompt est passé séparément
        );
      } else if (selectedModel === 'llama') {
        llmResponse = await llmService.generateResponse(
          history,
          lastAttachments,
          systemPrompt
        );
      } else {
        // Par défaut, utiliser Gemini
        llmResponse = await llmServicer.generateResponse(
          content,
          history,
          lastAttachments,
          conversationId,
          systemPrompt
        );
      }

      // 9. Créer le message assistant en BDD
      const assistantMessage = await this.createMessage({
        conversationId,
        userId,
        content: llmResponse.content,
        role: 'assistant',
        model: llmResponse.model,
        tokens: llmResponse.tokens,
      });

      // 10. Retourner les deux messages
      return {
        userMessage: {
          ...userMessage,
          attachments,
        },
        assistantMessage: {
          ...assistantMessage,
          attachments: [],
        },
      };
    } catch (error) {
      console.error('[MessageService] Erreur dans sendMessage:', error);
      throw error;
    }
  },

  /**
   * Envoyer un message anonyme (sans sauvegarde en BDD)
   */
  async sendAnonymousMessage({ content, attachments = [], roleId = null, userId = null }) {
    try {
      // Récupérer le system prompt si roleId fourni
      let systemPrompt = null;
      if (roleId && userId) {
        try {
          systemPrompt = await roleService.getSystemPrompt(roleId, userId);
        } catch (err) {
          console.warn('[MessageService] Erreur récupération rôle anonyme:', err);
        }
      }

      const lastAttachments = attachments.length > 0 ? attachments : [];
      const llmResponse = await llmServicer.generateResponse(
        content,
        [],
        lastAttachments,
        Math.random() * 100,
        systemPrompt
      );

      return {
        userMessage: {
          id: `temp-${Date.now()}`,
          content: content?.trim() || '',
          role: 'user',
          createdAt: new Date().toISOString(),
          attachments,
        },
        assistantMessage: {
          id: `temp-${Date.now()}ia`,
          content: llmResponse.content,
          role: 'assistant',
          model: llmResponse.model,
          createdAt: new Date().toISOString(),
          attachments: [],
        },
      };
    } catch (error) {
      console.error('[MessageService] Erreur dans sendAnonymousMessage:', error);
      throw error;
    }
  },

  /**
   * Récupérer tous les messages d'une conversation
   */
  async getConversationMessages(conversationId, userId) {
    await conversationService.getConversationById(conversationId, userId);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map(msg => ({
      ...msg,
      attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
    }));
  },

  /**
   * Récupérer un message unique
   */
  async getMessageById(messageId, userId) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: { userId },
      },
    });

    if (!message) {
      throw new Error('Message non trouvé ou accès non autorisé');
    }

    return {
      ...message,
      attachments: Array.isArray(message.attachments) ? message.attachments : [],
    };
  },

  /**
   * Mettre à jour le contenu d'un message
   */
  async updateMessage(messageId, userId, content) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        userId,
        role: 'user',
      },
    });

    if (!message) {
      throw new Error('Message non trouvé ou non modifiable');
    }

    return await prisma.message.update({
      where: { id: messageId },
      data: { content },
    });
  },

  /**
   * Supprimer un message
   */
  async deleteMessage(messageId, userId) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: { userId },
      },
    });

    if (!message) {
      throw new Error('Message non trouvé ou accès non autorisé');
    }

    await prisma.message.delete({ where: { id: messageId } });
    await conversationService.touchConversation(message.conversationId);

    return { success: true };
  },

  /**
   * Statistiques simples sur une conversation
   */
  async getConversationStats(conversationId, userId) {
    await conversationService.getConversationById(conversationId, userId);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      select: { role: true, attachments: true },
    });

    return {
      total: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      assistantMessages: messages.filter(m => m.role === 'assistant').length,
      messagesWithAttachments: messages.filter(m => !!m.attachments).length,
    };
  },

  /**
   * Compter les messages
   */
  async countMessages(conversationId) {
    return prisma.message.count({ where: { conversationId } });
  },
};