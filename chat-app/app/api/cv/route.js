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

async function uploadFile(file, userId) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const bucket = "your-bucket-name"; // ✅ Ajouter le nom du bucket
  const conversationId = crypto.randomUUID(); // ✅ Générer un ID

  try {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Fichier trop volumineux");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = String(file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${userId}/${conversationId}/${Date.now()}_${crypto.randomUUID()}_${safeName}`;

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    
    if (error) throw error;

    const { data: publicUrl } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return {
      bucket,
      path: storagePath,
      url: publicUrl?.publicUrl,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error(`Erreur upload:`, error);
    return null;
  }
}