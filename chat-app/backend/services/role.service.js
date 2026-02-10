// backend/services/role.service.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const roleService = {
  /**
   * Récupérer tous les rôles accessibles par un utilisateur
   * (ses propres rôles + rôles partagés avec lui + rôles système)
   */
  async getRolesByUser(userId) {
    if (!userId) return [];

    try {
      // 1. Récupérer les rôles possédés par l'utilisateur
      const { data: ownedRoles, error: err1 } = await supabase
        .from('roles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (err1) throw err1;

      // 2. Récupérer les rôles partagés avec l'utilisateur
      const { data: sharedRoles, error: err2 } = await supabase
        .from('role_shares')
        .select(`
          role_id,
          can_edit,
          created_at,
          roles:role_id (
            id,
            name,
            description,
            system_prompt,
            icon,
            category,
            user_id,
            visibility,
            is_active,
            usage_count,
            created_at,
            updated_at
          )
        `)
        .eq('shared_with_user_id', userId);

      if (err2) throw err2;

      // 3. Récupérer les rôles système (publics)
      const { data: systemRoles, error: err3 } = await supabase
        .from('roles')
        .select('*')
        .eq('visibility', 'system')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (err3) throw err3;

      // Fusionner et formater les résultats
      const owned = (ownedRoles || []).map(role => ({
        ...role,
        isOwned: true,
        canEdit: true,
        source: 'owned',
      }));

      const shared = (sharedRoles || [])
        .filter(s => s.roles) // Filtrer les rôles supprimés
        .map(s => ({
          ...s.roles,
          isOwned: false,
          canEdit: s.can_edit,
          sharedAt: s.created_at,
          source: 'shared',
        }));

      const system = (systemRoles || []).map(role => ({
        ...role,
        isOwned: false,
        canEdit: false,
        source: 'system',
      }));

      // Éliminer les doublons (si un rôle est à la fois possédé et partagé)
      const rolesMap = new Map();
      
      // Priorité : owned > shared > system
      [...system, ...shared, ...owned].forEach(role => {
        if (!rolesMap.has(role.id)) {
          rolesMap.set(role.id, role);
        } else if (role.isOwned) {
          rolesMap.set(role.id, role); // Toujours prioriser owned
        }
      });

      return Array.from(rolesMap.values());
    } catch (error) {
      console.error('[RoleService] Erreur getRolesByUser:', error);
      throw error;
    }
  },

  /**
   * Récupérer un rôle spécifique (avec vérification d'accès)
   */
  async getRoleById(roleId, userId) {
    if (!roleId || !userId) return null;

    try {
      // 1. Vérifier si c'est le propriétaire
      const { data: ownedRole, error: err1 } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .eq('user_id', userId)
        .maybeSingle();

      if (err1) throw err1;
      if (ownedRole) {
        return { ...ownedRole, isOwned: true, canEdit: true };
      }

      // 2. Vérifier si c'est un rôle système
      const { data: systemRole, error: err2 } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .eq('visibility', 'system')
        .eq('is_active', true)
        .maybeSingle();

      if (err2) throw err2;
      if (systemRole) {
        return { ...systemRole, isOwned: false, canEdit: false };
      }

      // 3. Vérifier si partagé avec l'utilisateur
      const { data: sharedRole, error: err3 } = await supabase
        .from('role_shares')
        .select(`
          can_edit,
          roles:role_id (*)
        `)
        .eq('role_id', roleId)
        .eq('shared_with_user_id', userId)
        .maybeSingle();

      if (err3) throw err3;
      if (sharedRole && sharedRole.roles) {
        return {
          ...sharedRole.roles,
          isOwned: false,
          canEdit: sharedRole.can_edit,
        };
      }

      return null;
    } catch (error) {
      console.error('[RoleService] Erreur getRoleById:', error);
      throw error;
    }
  },

  /**
   * Créer un nouveau rôle personnalisé
   */
  async createRole(userId, { name, system_prompt, description = '', icon = '🤖', category = 'custom', visibility = 'private' }) {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          user_id: userId,
          name,
          system_prompt,
          description,
          icon,
          category,
          visibility,
          is_active: true,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[RoleService] Erreur createRole:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un rôle (uniquement si propriétaire ou permission d'édition)
   */
  async updateRole(roleId, userId, updates) {
    try {
      // Vérifier les permissions
      const role = await this.getRoleById(roleId, userId);
      if (!role) throw new Error('Rôle non trouvé');
      if (!role.canEdit) throw new Error('Permission d\'édition refusée');

      const { data, error } = await supabase
        .from('roles')
        .update({
          name: updates.name,
          system_prompt: updates.system_prompt,
          description: updates.description,
          icon: updates.icon,
          category: updates.category,
          visibility: updates.visibility,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[RoleService] Erreur updateRole:', error);
      throw error;
    }
  },

  /**
   * Supprimer un rôle (uniquement propriétaire)
   */
  async deleteRole(roleId, userId) {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[RoleService] Erreur deleteRole:', error);
      throw error;
    }
  },

  /**
   * Partager un rôle avec un autre utilisateur
   */
  async shareRole(roleId, ownerUserId, targetUserId, canEdit = false) {
    try {
      // Vérifier que l'utilisateur est bien propriétaire
      const { data: role, error: err1 } = await supabase
        .from('roles')
        .select('id')
        .eq('id', roleId)
        .eq('user_id', ownerUserId)
        .single();

      if (err1 || !role) {
        throw new Error('Vous n\'êtes pas propriétaire de ce rôle');
      }

      // Créer ou mettre à jour le partage
      const { error: err2 } = await supabase
        .from('role_shares')
        .upsert(
          {
            role_id: roleId,
            shared_with_user_id: targetUserId,
            shared_by_user_id: ownerUserId,
            can_edit: canEdit,
          },
          {
            onConflict: 'role_id,shared_with_user_id',
          }
        );

      if (err2) throw err2;
      return true;
    } catch (error) {
      console.error('[RoleService] Erreur shareRole:', error);
      throw error;
    }
  },

  /**
   * Révoquer le partage d'un rôle
   */
  async revokeShare(roleId, ownerUserId, targetUserId) {
    try {
      const { error } = await supabase
        .from('role_shares')
        .delete()
        .eq('role_id', roleId)
        .eq('shared_with_user_id', targetUserId)
        .eq('shared_by_user_id', ownerUserId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[RoleService] Erreur revokeShare:', error);
      throw error;
    }
  },

  /**
   * Récupérer uniquement le system prompt d'un rôle
   */
  async getSystemPrompt(roleId, userId) {
    try {
      const role = await this.getRoleById(roleId, userId);
      return role?.system_prompt || null;
    } catch (error) {
      console.error('[RoleService] Erreur getSystemPrompt:', error);
      return null;
    }
  },

  /**
   * Récupérer tous les rôles système (prédéfinis)
   */
  async getSystemRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('visibility', 'system')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[RoleService] Erreur getSystemRoles:', error);
      return [];
    }
  },

  /**
   * Incrémenter le compteur d'utilisation d'un rôle
   */
  async incrementUsageCount(roleId) {
    try {
      const { error } = await supabase.rpc('increment_role_usage', {
        role_id: roleId,
      });

      if (error) {
        // Si la fonction n'existe pas, utiliser une requête UPDATE simple
        const { error: updateError } = await supabase
          .from('roles')
          .update({ usage_count: supabase.raw('usage_count + 1') })
          .eq('id', roleId);
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('[RoleService] Erreur incrementUsageCount:', error);
      // Ne pas bloquer si l'incrémentation échoue
    }
  },

  /**
   * Récupérer les utilisateurs avec qui un rôle est partagé
   */
  async getRoleShares(roleId, ownerUserId) {
    try {
      // Vérifier ownership
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('id', roleId)
        .eq('user_id', ownerUserId)
        .single();

      if (!role) throw new Error('Non autorisé');

      const { data, error } = await supabase
        .from('role_shares')
        .select(`
          id,
          shared_with_user_id,
          can_edit,
          created_at
        `)
        .eq('role_id', roleId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[RoleService] Erreur getRoleShares:', error);
      throw error;
    }
  },
};