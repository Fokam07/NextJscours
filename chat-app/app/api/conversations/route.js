import { NextResponse } from 'next/server';
import { conversationService } from '@/backend/services/conversation.service';

/**
 * GET /api/conversations
 * Récupérer toutes les conversations de l'utilisateur
 */
export async function GET(request) {
  try {
    // TODO: Récupérer l'userId depuis Supabase session
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const conversations = await conversationService.getUserConversations(userId);
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erreur GET /api/conversations:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Créer une nouvelle conversation
 */
export async function POST(request) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { title } = await request.json();
    
    const conversation = await conversationService.createConversation(
      userId,
      title
    );
    
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/conversations:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}