// backend/services/upload.service.js
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const uploadService = {
  /**
   * Upload des fichiers sur le système de fichiers local
   * @param {Array} files - Tableau de fichiers à uploader
   * @returns {Array} - Tableau d'objets contenant les informations des fichiers uploadés
   */
  async uploadFiles(files) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Créer le dossier uploads s'il n'existe pas
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Générer un nom de fichier unique
        const fileExtension = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Écrire le fichier sur le disque
        await writeFile(filePath, buffer);

        // Créer l'objet de résultat
        uploadedFiles.push({
          url: `/uploads/${fileName}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Erreur upload fichier ${file.name}:`, error);
        throw new Error(`Échec upload: ${file.name}`);
      }
    }

    return uploadedFiles;
  },

  /**
   * Valider un fichier avant upload
   * @param {File} file - Fichier à valider
   * @returns {Object} - { valid: boolean, error?: string }
   */
  validateFile(file) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `Le fichier ${file.name} dépasse la taille maximale de 10MB`,
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé: ${file.type}`,
      };
    }

    return { valid: true };
  },

  /**
   * Valider plusieurs fichiers
   * @param {Array} files - Tableau de fichiers à valider
   * @returns {Object} - { valid: boolean, errors: Array }
   */
  validateFiles(files) {
    const errors = [];

    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        errors.push(validation.error);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};