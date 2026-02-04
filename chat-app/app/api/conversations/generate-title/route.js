// api/conversations/generate-title/route.js
// Route pour la génération automatique de titres

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { llmService } from '@/backend/services/llm.service';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { message, conversationId } = await request.json();

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: 'Message et conversationId requis' },
        { status: 400 }
      );
    }

    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    // Générer le titre avec Groq AI
    const title = await llmService.generateConversationTitle(message);

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });

    return NextResponse.json({ title });

  } catch (error) {
    console.error('Erreur génération titre:', error);
    
    // En cas d'erreur, générer un titre simple
    try {
      const { message } = await request.json();
      const fallbackTitle = llmService.generateSimpleTitle(message || '');
      return NextResponse.json({ title: fallbackTitle });
    } catch (e) {
      return NextResponse.json(
        { error: 'Erreur lors de la génération du titre' },
        { status: 500 }
      );
    }
  }
}