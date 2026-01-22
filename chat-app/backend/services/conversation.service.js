import prisma from '../lib/prisma.js';

export const conversationService = {
  /**
   * Créer une nouvelle conversation
   */
  async createConversation(userId, title = 'Nouvelle conversation') {
    return await prisma.conversation.create({
      data: {
        title,
        userId,
      },
      include: {
        messages: true,
      },
    });
  },

  /**
   * Récupérer toutes les conversations d'un utilisateur
   */
  async getUserConversations(userId) {
    return await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1, // Juste le premier message pour l'aperçu
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  /**
   * Récupérer une conversation par ID
   */
  async getConversationById(conversationId, userId) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId, // Vérifier que l'utilisateur possède cette conversation
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    return conversation;
  },

  /**
   * Mettre à jour le titre d'une conversation
   */
  async updateConversationTitle(conversationId, userId, title) {
    return await prisma.conversation.update({
      where: {
        id: conversationId,
        userId,
      },
      data: { title },
    });
  },

  /**
   * Supprimer une conversation
   */
  async deleteConversation(conversationId, userId) {
    return await prisma.conversation.delete({
      where: {
        id: conversationId,
        userId,
      },
    });
  },

  /**
   * Mettre à jour le timestamp d'une conversation
   */
  async touchConversation(conversationId) {
    return await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  },
};  