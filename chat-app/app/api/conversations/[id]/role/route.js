// backend/routes/roles.routes.js
import { Router } from 'express';
import { roleService } from '@/services/role.service.js';

const router = Router();

/**
 * Middleware pour vérifier l'authentification
 * Adapter selon votre système d'auth
 */
const requireAuth = (req, res, next) => {
  // Exemple avec Supabase JWT
  const userId = req.user?.id || req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  req.userId = userId;
  next();
};

// ==================== ROUTES PUBLIQUES ====================

/**
 * GET /api/roles/system
 * Récupérer tous les rôles système (prédéfinis)
 */
router.get('/system', async (req, res) => {
  try {
    const systemRoles = await roleService.getSystemRoles();
    res.json({ roles: systemRoles });
  } catch (error) {
    console.error('[API] Erreur récupération rôles système:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== ROUTES AUTHENTIFIÉES ====================

/**
 * GET /api/roles
 * Récupérer tous les rôles accessibles par l'utilisateur
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const roles = await roleService.getRolesByUser(req.userId);
    res.json({ roles });
  } catch (error) {
    console.error('[API] Erreur récupération rôles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/roles/:id
 * Récupérer un rôle spécifique
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id, req.userId);
    
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }
    
    res.json({ role });
  } catch (error) {
    console.error('[API] Erreur récupération rôle:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/roles
 * Créer un nouveau rôle personnalisé
 * 
 * Body: {
 *   name: string,
 *   system_prompt: string,
 *   description?: string,
 *   icon?: string,
 *   category?: string,
 *   visibility?: 'private' | 'shared'
 * }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, system_prompt, description, icon, category, visibility } = req.body;
    
    // Validation
    if (!name || !system_prompt) {
      return res.status(400).json({ 
        error: 'Le nom et le system_prompt sont requis' 
      });
    }
    
    if (name.length > 100) {
      return res.status(400).json({ 
        error: 'Le nom ne peut pas dépasser 100 caractères' 
      });
    }
    
    if (system_prompt.length < 10) {
      return res.status(400).json({ 
        error: 'Le system_prompt doit contenir au moins 10 caractères' 
      });
    }
    
    const role = await roleService.createRole(req.userId, {
      name,
      system_prompt,
      description: description || '',
      icon: icon || '🤖',
      category: category || 'custom',
      visibility: visibility || 'private',
    });
    
    res.status(201).json({ 
      role,
      message: 'Rôle créé avec succès' 
    });
  } catch (error) {
    console.error('[API] Erreur création rôle:', error);
    res.status(500).json({ error: 'Erreur lors de la création du rôle' });
  }
});

/**
 * PUT /api/roles/:id
 * Mettre à jour un rôle existant
 * 
 * Body: {
 *   name?: string,
 *   system_prompt?: string,
 *   description?: string,
 *   icon?: string,
 *   category?: string,
 *   visibility?: string
 * }
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, system_prompt, description, icon, category, visibility } = req.body;
    
    // Vérifier qu'au moins un champ est fourni
    if (!name && !system_prompt && !description && !icon && !category && !visibility) {
      return res.status(400).json({ 
        error: 'Aucune modification fournie' 
      });
    }
    
    const role = await roleService.updateRole(req.params.id, req.userId, {
      name,
      system_prompt,
      description,
      icon,
      category,
      visibility,
    });
    
    res.json({ 
      role,
      message: 'Rôle mis à jour avec succès' 
    });
  } catch (error) {
    console.error('[API] Erreur mise à jour rôle:', error);
    
    if (error.message.includes('Permission')) {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
  }
});

/**
 * DELETE /api/roles/:id
 * Supprimer un rôle
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await roleService.deleteRole(req.params.id, req.userId);
    
    res.json({ 
      message: 'Rôle supprimé avec succès' 
    });
  } catch (error) {
    console.error('[API] Erreur suppression rôle:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rôle' });
  }
});

// ==================== PARTAGE ====================

/**
 * POST /api/roles/:id/share
 * Partager un rôle avec un autre utilisateur
 * 
 * Body: {
 *   targetUserId: string,
 *   canEdit?: boolean
 * }
 */
router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    const { targetUserId, canEdit } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({ 
        error: 'targetUserId requis' 
      });
    }
    
    if (targetUserId === req.userId) {
      return res.status(400).json({ 
        error: 'Vous ne pouvez pas partager un rôle avec vous-même' 
      });
    }
    
    await roleService.shareRole(
      req.params.id,
      req.userId,
      targetUserId,
      canEdit || false
    );
    
    res.json({ 
      message: 'Rôle partagé avec succès' 
    });
  } catch (error) {
    console.error('[API] Erreur partage rôle:', error);
    
    if (error.message.includes('propriétaire')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur lors du partage du rôle' });
  }
});

/**
 * DELETE /api/roles/:id/share/:targetUserId
 * Révoquer le partage d'un rôle
 */
router.delete('/:id/share/:targetUserId', requireAuth, async (req, res) => {
  try {
    await roleService.revokeShare(
      req.params.id,
      req.userId,
      req.params.targetUserId
    );
    
    res.json({ 
      message: 'Partage révoqué avec succès' 
    });
  } catch (error) {
    console.error('[API] Erreur révocation partage:', error);
    res.status(500).json({ error: 'Erreur lors de la révocation du partage' });
  }
});

/**
 * GET /api/roles/:id/shares
 * Récupérer la liste des partages d'un rôle
 */
router.get('/:id/shares', requireAuth, async (req, res) => {
  try {
    const shares = await roleService.getRoleShares(req.params.id, req.userId);
    res.json({ shares });
  } catch (error) {
    console.error('[API] Erreur récupération partages:', error);
    
    if (error.message.includes('autorisé')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;