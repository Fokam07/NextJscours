// backend/services/conversation.service.js
import prisma from '../lib/prisma.js';
import { roleService } from './role.service.js';
import { llmServicer } from './llm.service.js'; // ✅ Import ajouté

export const conversationService = {
  /**
   * Créer une nouvelle conversation + injecter le system prompt si rôle sélectionné
   */
  async createConversation(userId, title = 'Nouvelle conversation', roleId = null) {
    // 1. Créer la conversation
    const conversation = await prisma.conversation.create({
      data: {
        title,
        userId,
      },
      include: {
        messages: true,
      },
    });

    // 2. Si un rôle est choisi → créer immédiatement un message système
    if (roleId) {
      try {
        const role = await roleService.getRoleById(roleId, userId);
        if (role?.system_prompt) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: 'system',
              content: role.system_prompt,
            },
          });
          console.log('[ConversationService] Rôle initial appliqué:', role.name);
        }
      } catch (err) {
        console.warn('[ConversationService] Impossible de charger le rôle système:', err);
      }
    }

    return conversation;
  },

  async getUserConversations(userId) {
    return await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getConversationById(conversationId, userId) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) throw new Error('Conversation non trouvée');
    return conversation;
  },

  async updateConversationTitle(conversationId, userId, title) {
    return await prisma.conversation.update({
      where: { id: conversationId, userId },
      data: { title },
    });
  },

  async deleteConversation(conversationId, userId) {
    // ✅ Invalider le cache avant de supprimer
    llmServicer.clearChatCache(conversationId);
    
    return await prisma.conversation.delete({
      where: { id: conversationId, userId },
    });
  },

  async touchConversation(conversationId) {
    return await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  },

  /**
   * ✅ CORRECTION MAJEURE : Changer de rôle en cours de conversation
   * Supprime l'ancien message système et en crée un nouveau
   * CRITIQUE : Invalide le cache du chat pour forcer la recréation
   */
  async changeConversationRole(conversationId, userId, newRoleId) {
    const conversation = await this.getConversationById(conversationId, userId);

    // ✅ CRITIQUE: Invalider le cache du chat AVANT de changer le system prompt
    // Sans cette étape, Gemini continue d'utiliser l'ancien system prompt
    llmServicer.clearChatCache(conversationId);
    console.log('[ConversationService] ✅ Cache chat invalidé pour conversation:', conversationId);

    // Supprimer l'ancien message système s'il existe
    const deletedCount = await prisma.message.deleteMany({
      where: { conversationId, role: 'system' },
    });
    console.log('[ConversationService] Messages système supprimés:', deletedCount.count);

    if (newRoleId) {
      const role = await roleService.getRoleById(newRoleId, userId);
      if (role?.system_prompt) {
        await prisma.message.create({
          data: {
            conversationId,
            role: 'system',
            content: role.system_prompt,
          },
        });
        console.log('[ConversationService] ✅ Nouveau system prompt injecté:', role.name);
        console.log('[ConversationService] Prompt:', role.system_prompt.substring(0, 100) + '...');
      }
    } else {
      console.log('[ConversationService] Aucun rôle sélectionné, mode par défaut');
    }

    return conversation;
  },
};