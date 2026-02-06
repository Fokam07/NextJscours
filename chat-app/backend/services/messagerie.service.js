// backend/services/message.service.js
import prisma from '../lib/prisma.js';
import { conversationService } from './conversation.service.js';
import { llmServicer , llmService} from './llm.service.js';

export const messageService = {
  /**
   * Créer un message (utilisateur ou assistant)
   * @param {Object} param
   * @param {string} param.conversationId
   * @param {string} [param.userId]         // requis pour user, optionnel pour assistant
   * @param {string} param.content
   * @param {'user'|'assistant'} param.role
   * @param {string} [param.model]
   * @param {number} [param.tokens]
   * @param {Array} [param.attachments]     // tableau d'objets {name, url, type, size?, ...}
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
        userId: role === 'user' ? userId : null, // assistant n'a pas de userId
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
   * Gère aussi la création du titre automatique si première interaction
   */
  async sendMessage({ conversationId, userId, content, attachments = [], selectedModel = 'gemini'}) {
    try {
      // 1. Vérifier que la conversation existe et appartient à l'utilisateur
      const conversation = await conversationService.getConversationById(conversationId, userId);
      if (!conversation) {
        throw new Error('Conversation non trouvée ou accès non autorisé');
      }

      // 2. Créer le message utilisateur
      const userMessage = await this.createMessage({
        conversationId,
        userId,
        content,
        role: 'user',
        attachments,
      });

      // 3. Récupérer tout l'historique (incluant le message qu'on vient de créer)
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        select: {
          role: true,
          content: true,
          attachments: true,
        },
      });

      // 4. Préparer le format attendu par le LLM
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // 5. Générer un titre automatique si c'est le tout premier message utilisateur
      if (history.length === 1 && history[0].role === 'user') {
        const title = await llmService.generateConversationTitle(content);
        await conversationService.updateConversationTitle(conversationId, userId, title);
      }

      // 6. Demander la réponse au LLM (en lui passant éventuellement les attachments du dernier message)
      const lastAttachments = attachments.length > 0 ? attachments : [];
      let llmResponse;
      
      // Choisir le service LLM selon le modèle sélectionné
      if (selectedModel === 'gemini') {
        llmResponse = await llmServicer.generateResponse(content, history, lastAttachments, conversationId);
      } else if (selectedModel === 'llama') {
        llmResponse = await llmService.generateResponse(history, lastAttachments);
      } else {
        // Par défaut, utiliser Gemini
        llmResponse = await llmServicer.generateResponse(content, history, lastAttachments, conversationId);
      }

      // 7. Créer le message assistant
      const assistantMessage = await this.createMessage({
        conversationId,
        userId, // passé mais ignoré en interne pour role=assistant
        content: llmResponse.content,
        role: 'assistant',
        model: llmResponse.model,
        tokens: llmResponse.tokens,
      });

      // 8. Retour (avec attachments parsés pour le client)
      return {
        userMessage: {
          ...userMessage,
          attachments: attachments,
        },
        assistantMessage: {
          ...assistantMessage,
          attachments: [],
        },
      };
    } catch (error) {
      console.error('Erreur dans sendMessage:', error);
      throw error;
    }
  },
  
  /**
   * Envoyer un message utilisateur → générer la réponse IA
   * Gère aussi la création du titre automatique si première interaction
   */
  async sendAnonymousMessage({ content, attachments = []}) {
    try {
      // 6. Demander la réponse au LLM (en lui passant éventuellement les attachments du dernier message)
      const lastAttachments = attachments.length > 0 ? attachments : [];
      const llmResponse = await llmServicer.generateResponse( content, [], lastAttachments, Math.random()*100);

      // 8. Retour (avec attachments parsés pour le client)
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
          model: llmResponse.nodel,
          createdAt: new Date().toISOString(),
          attachments: [],
        },
      };
    } catch (error) {
      console.error('Erreur dans sendMessage:', error);
      throw error;
    }
  },

  /**
   * Récupérer tous les messages d'une conversation (avec parsing des attachments)
   */
  async getConversationMessages(conversationId, userId) {
    // Vérification d'accès
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
   * Récupérer un message unique (avec vérification d'appartenance)
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
   * Mettre à jour le contenu d'un message (uniquement si c'est un message de l'utilisateur)
   */
  async updateMessage(messageId, userId, content) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        userId,
        role: 'user', // on ne modifie que les messages utilisateur
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

    // Optionnel : on peut retoucher la conversation ou recalculer quelque chose ici
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
   * (Optionnel) Compter les messages
   */
  async countMessages(conversationId) {
    return prisma.message.count({ where: { conversationId } });
  },
};