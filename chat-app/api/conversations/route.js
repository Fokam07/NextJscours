import { NextResponse } from 'next/server';
import { conversationService } from '@/backend/services/conversation.service.js';

/**
 * GET /api/conversations
 * Récupérer toutes les conversations de l'utilisateur
 */
export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    console.log('📥 GET /api/conversations - userId:', userId);
    const conversations = await conversationService.getUserConversations(userId);
    console.log('✅ Conversations récupérées:', conversations.length);
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('❌ Erreur GET /api/conversations:', error);
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

    const body = await request.json().catch(() => ({}));
    const title = body.title || 'Nouvelle conversation';
    
    console.log('📝 POST /api/conversations - userId:', userId, 'title:', title);
    const conversation = await conversationService.createConversation(
      userId,
      title
    );
    console.log('✅ Conversation créée:', conversation.id);
    
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur POST /api/conversations:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}