// api/conversations/[id]/messages/route.js
// Route API adaptée à votre structure existante avec support des fichiers

import { NextResponse } from 'next/server';
import { messageService } from '@/backend/services/messagerie.service';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
export const dynamic = 'force-dynamic'; // ✅ évite certaines optimisations build

export async function POST(request, { params }) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      const contentType = request.headers.get('content-type') || '';
      let content = '';
      let attachments = [];

      if (contentType.includes('multipart/form-data')) {
        // Traiter FormData (avec fichiers)
        const formData = await request.formData();
        content = formData.get('content') || '';
        const files = formData.getAll('files');

        // Upload des fichiers si présents
        if (files && files.length > 0) {
          attachments = await uploadFiles(files, userId, params.id);
        }
      } else {
        // Traiter JSON simple (sans fichiers)
        const body = await request.json();
        content = body.content || '';
      }

      const response = await messageService.sendAnonymousMessage({content, attachments: attachments.length > 0 ? attachments : undefined})
      return NextResponse.json(response);
    }

    // Vérifier le type de contenu pour déterminer si des fichiers sont envoyés
    const contentType = request.headers.get('content-type') || '';
    let content = '';
    let attachments = [];
    let selectedModel = 'gemini'; // Valeur par défaut

    if (contentType.includes('multipart/form-data')) {
      // Traiter FormData (avec fichiers)
      const formData = await request.formData();
      content = formData.get('content') || '';
      selectedModel = formData.get('selectedModel') || 'gemini'; // Extraire le modèle sélectionné
      const files = formData.getAll('files');

      // Upload des fichiers si présents
      if (files && files.length > 0) {
        attachments = await uploadFiles(files, userId, params.id);
      }
    } else {
      // Traiter JSON simple (sans fichiers)
      const body = await request.json();
      content = body.content || '';
      selectedModel = body.selectedModel || 'gemini'; // Extraire le modèle du JSON
    }

    // Appeler votre messageService existant avec les pièces jointes et le modèle
    const message = await messageService.sendMessage({
      conversationId: params.id,
      userId,
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
      selectedModel // Passer le modèle sélectionné au service
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Erreur POST /api/messages:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Fonction pour uploader les fichiers
 */
async function uploadFiles(files, userId, conversationId) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const bucket = "attachments";

  // si userId vide, on peut soit bloquer, soit ranger dans "anonymous"
  const safeUser = userId || "anonymous";

  const uploadedFiles = [];

  for (const file of files) {
    try {
      if (file.size > MAX_FILE_SIZE) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeName = String(file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${safeUser}/${conversationId}/${Date.now()}_${crypto.randomUUID()}_${safeName}`;

      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (error) throw error;

      uploadedFiles.push({
        bucket,
        path: storagePath,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });
    } catch (e) {
      console.error(`Erreur upload ${file?.name}:`, e);
    }
  }

  return uploadedFiles;
}

