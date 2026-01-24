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
    try {
      console.log('📚 Fetching conversations for userId:', userId);
      
      const conversations = await prisma.conversation.findMany({
        where: { userId: String(userId) },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 1, // Juste le premier message pour l'aperçu
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      
      console.log('✅ Found', conversations.length, 'conversations');
      return conversations;
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw error;
    }
  },

  /**
   * Récupérer une conversation par ID
   */
  async getConversationById(conversationId, userId) {
    try {
      console.log('🔍 Fetching conversation:', conversationId, 'for userId:', userId);
      
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: String(userId), // Vérifier que l'utilisateur possède cette conversation
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

      console.log('✅ Conversation found with', conversation.messages.length, 'messages');
      return conversation;
    } catch (error) {
      console.error('❌ Error fetching conversation:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour le titre d'une conversation
   */
  async updateConversationTitle(conversationId, userId, title) {
    try {
      console.log('✏️ Updating conversation:', conversationId, 'title:', title);
      
      const conversation = await prisma.conversation.update({
        where: {
          id: conversationId,
          userId: String(userId),
        },
        data: { title },
      });
      
      console.log('✅ Conversation title updated');
      return conversation;
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
      throw error;
    }
  },

  /**
   * Supprimer une conversation
   */
  async deleteConversation(conversationId, userId) {
    try {
      console.log('🗑️ Deleting conversation:', conversationId);
      
      const result = await prisma.conversation.delete({
        where: {
          id: conversationId,
          userId: String(userId),
        },
      });
      
      console.log('✅ Conversation deleted');
      return result;
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour le timestamp d'une conversation
   */
  async touchConversation(conversationId) {
    try {
      return await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      console.error('❌ Error touching conversation:', error);
      throw error;
    }
  },
};