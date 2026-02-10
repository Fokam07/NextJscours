import prisma from '../lib/prisma.js';

export const conversationService = {
  /**
   * Créer une nouvelle conversation
   * @param {string} userId - ID de l'utilisateur
   * @param {string} title - Titre de la conversation
   * @param {string|null} roleId - ID du rôle à utiliser (optionnel)
   */
  async createConversation(userId, title = 'Nouvelle conversation', roleId = null) {
    return await prisma.conversation.create({
      data: {
        title,
        userId,
        roleId, // Support du rôle personnalisé
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
   * Retourne la conversation avec son roleId
   */
  async getConversationById(conversationId, userId) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
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
   * Mettre à jour le rôle d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} userId - ID de l'utilisateur
   * @param {string|null} roleId - ID du nouveau rôle (ou null pour désactiver)
   */
  async updateConversationRole(conversationId, userId, roleId) {
    return await prisma.conversation.update({
      where: {
        id: conversationId,
        userId,
      },
      data: { roleId },
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

  /**
   * Récupérer le rôle d'une conversation
   */
  async getConversationRole(conversationId, userId) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      select: {
        roleId: true,
      },
    });

    return conversation?.roleId || null;
  },
};