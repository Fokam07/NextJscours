import { cvService } from "@/backend/services/cv.service";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
 try {
    const userId = request.headers.get('x-user-id');

    if(!userId){
        console.log('unAuthorized');
        return NextResponse.json(
            {error: 'unroconized'},
            {status: 403}
        );
    }

    const contentType = request.headers.get('content-type') || '';
    if(contentType.includes('multipart/form-data')){
        const formData = await request.formData();
        const cv = formData.get('cv');
        const offre = formData.get('offre');
        const poste = formData.get('poste');
        if(cv && offre){
            const existing =  await uploadFile(cv, userId );
            if(existing){
                const data = await cvService.generateCv({ offre, poste, existing});
                return NextResponse.json(data);
            }
            else
                throw new Error("fichier trop volumineux");
                
        }
    }

    console.log('bad request');
    return NextResponse.json(
        {error: 'bad-request'},
        {status: 400}
    );
    
 } catch (error) {
    console.log('erreur Post /api/cv:', error);
    return NextResponse.json(
        {error: error.message},
        {status: 500}
    );
 }   
}

async function uploadFile(file, userId, ) {
  const uploadDir = join(process.cwd(), 'public', 'uploads', userId, 'default');
  
  // Créer le dossier s'il n'existe pas
  await mkdir(uploadDir, { recursive: true });

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

 
    try {
      // Vérifier la taille
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`Fichier ${file.name} trop volumineux (${file.size} bytes)`);
        throw new Error("fichier trop volumineux");
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
      const publicUrl = `/uploads/${userId}/default/${fileName}`;

      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error(`Erreur upload fichier ${file.name}:`, error);
      return null;
    }
  
}