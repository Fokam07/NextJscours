// api/conversations/[id]/messages/route.js
// Route API adaptée à votre structure existante avec support des fichiers

import { NextResponse } from 'next/server';
import { messageService } from '@/backend/services/messagerie.service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request, { params }) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le type de contenu pour déterminer si des fichiers sont envoyés
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

    // Appeler votre messageService existant avec les pièces jointes
    const message = await messageService.sendMessage({
      conversationId: params.id,
      userId,
      content,
      attachments: attachments.length > 0 ? attachments : undefined
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
  const uploadDir = join(process.cwd(), 'public', 'uploads', userId, conversationId);
  
  // Créer le dossier s'il n'existe pas
  await mkdir(uploadDir, { recursive: true });

  const uploadedFiles = [];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  for (const file of files) {
    try {
      // Vérifier la taille
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`Fichier ${file.name} trop volumineux (${file.size} bytes)`);
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Générer un nom de fichier unique et sécurisé
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const filePath = join(uploadDir, fileName);

      // Écrire le fichier
      await writeFile(filePath, buffer);

      // URL publique du fichier
      const publicUrl = `/uploads/${userId}/${conversationId}/${fileName}`;

      uploadedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        path: filePath,
      });
    } catch (error) {
      console.error(`Erreur upload fichier ${file.name}:`, error);
    }
  }

  return uploadedFiles;
}