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
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
      },
    });

    // Mettre à jour le timestamp de la conversation
    await conversationService.touchConversation(conversationId);

    return message;
  },

  /**
   * Envoyer un message utilisateur → générer la réponse IA
   * Gère l'injection du system prompt selon le rôle de la conversation
   */
  async sendMessage({ 
    conversationId, 
    userId, 
    content, 
    attachments = [], 
    selectedModel = 'gemini' 
  }) {
    try {
      // 1. Vérifier que la conversation existe et appartient à l'utilisateur
      const conversation = await conversationService.getConversationById(conversationId, userId);
      if (!conversation) {
        throw new Error('Conversation non trouvée ou accès non autorisé');
      }

      // 2. 🆕 Récupérer le system prompt du rôle si défini
      let systemPrompt = null;
      let roleInfo = null;
      
      if (conversation.roleId) {
        console.log('[MessageService] Récupération du rôle:', conversation.roleId);
        
        try {
          roleInfo = await roleService.getRoleById(conversation.roleId, userId);
          if (roleInfo) {
            systemPrompt = roleInfo.system_prompt;
            console.log('[MessageService] System prompt appliqué:', systemPrompt.substring(0, 100) + '...');
            
            // Incrémenter le compteur d'utilisation
            await roleService.incrementUsageCount(conversation.roleId).catch(err => {
              console.warn('[MessageService] Erreur incrémentation usage:', err);
            });
          } else {
            console.warn('[MessageService] Rôle non trouvé:', conversation.roleId);
          }
        } catch (roleError) {
          console.error('[MessageService] Erreur récupération rôle:', roleError);
          // Continuer sans rôle si erreur
        }
      } else {
        console.log('[MessageService] Aucun rôle défini pour cette conversation');
      }

      // 3. Créer le message utilisateur
      const userMessage = await this.createMessage({
        conversationId,
        userId,
        content,
        role: 'user',
        attachments,
      });

      // 4. Récupérer tout l'historique
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        select: {
          role: true,
          content: true,
          attachments: true,
        },
      });

      // 5. Préparer le format attendu par le LLM
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // 6. Générer un titre automatique si c'est le tout premier message utilisateur
      if (history.length === 1 && history[0].role === 'user') {
        const title = await llmService.generateConversationTitle(content);
        await conversationService.updateConversationTitle(conversationId, userId, title);
      }

      // 7. 🆕 Demander la réponse au LLM avec le system prompt
      const lastAttachments = attachments.length > 0 ? attachments : [];
      let llmResponse;
      
      if (selectedModel === 'gemini') {
        llmResponse = await llmServicer.generateResponse(
          content, 
          history, 
          lastAttachments, 
          conversationId,
          systemPrompt // 👈 Injection du system prompt
        );
      } else if (selectedModel === 'llama') {
        llmResponse = await llmService.generateResponse(
          history, 
          lastAttachments,
          systemPrompt // 👈 Injection du system prompt
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

      // 8. Créer le message assistant
      const assistantMessage = await this.createMessage({
        conversationId,
        userId,
        content: llmResponse.content,
        role: 'assistant',
        model: llmResponse.model,
        tokens: llmResponse.tokens,
      });

      // 9. Retour avec info du rôle utilisé
      return {
        userMessage: {
          ...userMessage,
          attachments: attachments,
        },
        assistantMessage: {
          ...assistantMessage,
          attachments: [],
        },
        roleUsed: roleInfo ? {
          id: roleInfo.id,
          name: roleInfo.name,
          icon: roleInfo.icon,
        } : null,
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
        systemPrompt // System prompt pour message anonyme
      );

      return {
        userMessage: {
          id: `temp-${Date.now()}`,
          content: content?.trim() || '',
          role: 'user',
          createdAt: new Date().toISOString(),
          attachments
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
      attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
    }));
  },

  /**
   * Récupérer un message unique
   */
  async getMessageById(messageId, userId) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          userId,
        },
      },
    });

    if (!message) {
      throw new Error('Message non trouvé ou accès non autorisé');
    }

    return {
      ...message,
      attachments: message.attachments ? JSON.parse(message.attachments) : [],
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