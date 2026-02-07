// app/api/conversations/[id]/share/route.js
// SOLUTION WORKAROUND - Passe le token manuellement
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(request, context) {
  try {
    const params = await Promise.resolve(context.params);
    const conversationId = params.id;

    console.log('[Share API] Début - conversationId:', conversationId);

    // 🔥 RÉCUPÉRER LE TOKEN DEPUIS L'AUTHORIZATION HEADER
    const authHeader = request.headers.get('authorization');
    console.log('[Share API] Authorization header:', authHeader ? 'présent' : 'absent');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Share API] Pas de token Bearer dans le header');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Créer le client Supabase avec le token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Vérifier le token et récupérer l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    console.log('[Share API] Auth:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message 
    });

    if (!user) {
      console.error('[Share API] Token invalide');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = user.id;

    // Vérifier que la conversation existe
    console.log('[Share API] Recherche conversation:', conversationId);
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    console.log('[Share API] Conversation trouvée:', {
      found: !!conv,
      ownerId: conv?.userId,
      currentUserId: userId,
      isOwner: conv?.userId === userId
    });

    if (!conv) {
      console.error('[Share API] Conversation introuvable:', conversationId);
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    }

    if (conv.userId !== userId) {
      console.error('[Share API] Non autorisé - userId mismatch:', {
        convUserId: conv.userId,
        currentUserId: userId
      });
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Générer ou réutiliser shareId
    let shareId = conv.shareId;
    if (!shareId) {
      shareId = nanoid(10);
      console.log('[Share API] Nouveau shareId généré:', shareId);
    } else {
      console.log('[Share API] ShareId existant réutilisé:', shareId);
    }

    // Mettre à jour la conversation
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        shareId,
        isPublic: true,
      },
      select: { shareId: true },
    });

    console.log('[Share API] Conversation mise à jour:', updated);

    const baseUrl = process.env.RENDER_PUBLIC_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${updated.shareId}`;

    console.log('[Share API] Succès - URL générée:', shareUrl);

    return NextResponse.json({ success: true, shareUrl });
  } catch (err) {
    console.error('[Share API] ERREUR COMPLÈTE:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    }, { status: 500 });
  }
}