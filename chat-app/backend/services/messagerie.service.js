import prisma from '../lib/prisma.js';
import { conversationService } from './conversation.service.js';
import { llmService } from './llm.service.js';

export const messageService = {
  /**
   * Créer un nouveau message
   */
  async createMessage({ conversationId, userId, content, role, model = null, tokens = null }) {
    const message = await prisma.message.create({
      data: {
        content,
        role,
        conversationId,
        userId,
        model,
        tokens,
      },
    });

    // Mettre à jour le timestamp de la conversation
    await conversationService.touchConversation(conversationId);

    return message;
  },

  /**
   * Créer un message utilisateur et obtenir la réponse du LLM
   */
  async sendMessage({ conversationId, userId, content }) {
    // Créer le message utilisateur
    const userMessage = await this.createMessage({
      conversationId,
      userId,
      content,
      role: 'user',
    });

    // Récupérer l'historique de la conversation
    const conversation = await conversationService.getConversationById(
      conversationId,
      userId
    );

    // Formater l'historique pour le LLM
    const history = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    if (history.length === 0){
      const title = await llmService.generateConversationTitle(content)
      await conversationService.updateConversationTitle(conversationId, title);
    }

    // Obtenir la réponse du LLM
    const llmResponse = await llmService.generateResponse(history);

    // Créer le message de réponse
    const assistantMessage = await this.createMessage({
      conversationId,
      userId,
      content: llmResponse.content,
      role: 'assistant',
      model: llmResponse.model,
      tokens: llmResponse.tokens,
    });

    return {
      userMessage,
      assistantMessage,
    };
  },

  /**
   * Récupérer les messages d'une conversation
   */
  async getConversationMessages(conversationId, userId) {
    // Vérifier que l'utilisateur a accès à cette conversation
    await conversationService.getConversationById(conversationId, userId);

    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  },

  /**
   * Supprimer un message
   */
  async deleteMessage(messageId, userId) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        userId,
      },
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    return await prisma.message.delete({
      where: { id: messageId },
    });
  },
};