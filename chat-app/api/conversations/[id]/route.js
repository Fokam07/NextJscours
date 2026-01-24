import { NextResponse } from 'next/server';
import { conversationService } from '@/backend/services/conversation.service.js';

/**
 * GET /api/conversations/[id]
 * Récupérer une conversation spécifique
 */
export async function GET(request, { params }) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    console.log('📥 GET /api/conversations/[id] - conversationId:', params.id, 'userId:', userId);
    const conversation = await conversationService.getConversationById(
      params.id,
      userId
    );
    console.log('✅ Conversation récupérée:', conversation.id);
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('❌ Erreur GET /api/conversations/[id]:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message === 'Conversation non trouvée' ? 404 : 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id]
 * Mettre à jour une conversation
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

    const { title } = await request.json();
    
    console.log('📝 PATCH /api/conversations/[id] - conversationId:', params.id, 'title:', title);
    const conversation = await conversationService.updateConversationTitle(
      params.id,
      userId,
      title
    );
    console.log('✅ Conversation mise à jour:', conversation.id);
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('❌ Erreur PATCH /api/conversations/[id]:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id]
 * Supprimer une conversation
 */
export async function DELETE(request, { params }) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    console.log('🗑️ DELETE /api/conversations/[id] - conversationId:', params.id);
    await conversationService.deleteConversation(params.id, userId);
    console.log('✅ Conversation supprimée');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur DELETE /api/conversations/[id]:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}