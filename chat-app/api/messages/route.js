import { NextResponse } from 'next/server';
import { conversationService } from '@/backend/services/conversationService';

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

    const conversation = await conversationService.getConversationById(
      params.id,
      userId
    );
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Erreur GET /api/conversations/[id]:', error);
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
    
    const conversation = await conversationService.updateConversationTitle(
      params.id,
      userId,
      title
    );
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Erreur PATCH /api/conversations/[id]:', error);
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

    await conversationService.deleteConversation(params.id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/conversations/[id]:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}