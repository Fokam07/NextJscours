// app/api/conversations/[id]/role/route.js
import { NextResponse } from 'next/server';
import { conversationService } from '@/backend/services/conversation.service';

/**
 * PATCH /api/conversations/:id/role
 * Changer le rôle d'une conversation existante
 */
export async function PATCH(request, { params }) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: conversationId } = params;
    const body = await request.json();
    const { roleId } = body;

    console.log('[API] Changement de rôle - Conversation:', conversationId, 'RoleId:', roleId);

    // Changer le rôle de la conversation
    const updatedConversation = await conversationService.changeConversationRole(
      conversationId,
      userId,
      roleId
    );

    console.log('[API] ✅ Rôle changé avec succès');

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
      message: 'Rôle mis à jour avec succès'
    });

  } catch (error) {
    console.error('[API] Erreur changement de rôle:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du changement de rôle' },
      { status: 500 }
    );
  }
}