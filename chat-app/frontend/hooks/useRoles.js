// hooks/useRoles.js
import { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth.js';

export function useRoles(userId) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 

  const fetchRoles = async () => {
    if (!userId) return;
    console.log('[useRoles] Fetching roles for userId:', userId);
    try {
      setLoading(true);
      const response = await fetch('/api/roles', {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des rôles');

      const data = await response.json();
      setRoles(data.roles || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('[useRoles] Erreur fetchRoles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [userId]);

  const createRole = async (roleData) => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur création rôle');
      }

      const data = await response.json();
      setRoles(prev => [data.role, ...prev]);
      return data.role;
    } catch (err) {
      setError(err.message);
      console.error('[useRoles] Erreur createRole:', err);
      throw err;
    }
  };

  const updateRole = async (roleId, updates) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur mise à jour rôle');
      }

      const data = await response.json();
      setRoles(prev => prev.map(r => r.id === roleId ? data.role : r));
      return data.role;
    } catch (err) {
      setError(err.message);
      console.error('[useRoles] Erreur updateRole:', err);
      throw err;
    }
  };

  const deleteRole = async (roleId) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur suppression rôle');
      }

      setRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (err) {
      setError(err.message);
      console.error('[useRoles] Erreur deleteRole:', err);
      throw err;
    }
  };

  const shareRole = async (roleId, targetUserId, canEdit = false) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ targetUserId, canEdit }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur partage rôle');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('[useRoles] Erreur shareRole:', err);
      throw err;
    }
  };

  const revokeShare = async (roleId, targetUserId) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/share`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur révocation partage');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('[useRoles] Erreur revokeShare:', err);
      throw err;
    }
  };

  const getRoleShares = async (roleId) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/shares`, {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur récupération partages');
      }

      const data = await response.json();
      return data.shares || [];
    } catch (err) {
      setError(err.message);
      console.error('[useRoles] Erreur getRoleShares:', err);
      throw err;
    }
  };

  const getSystemRoles = async () => {
    try {
      const response = await fetch('/api/roles/system');

      if (!response.ok) {
        throw new Error('Erreur récupération rôles système');
      }

      const data = await response.json();
      return data.roles || [];
    } catch (err) {
      setError(err.message);
      console.error('[useRoles] Erreur getSystemRoles:', err);
      throw err;
    }
  };

  return {
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    shareRole,
    revokeShare,
    getRoleShares,
    getSystemRoles,
    refreshRoles: fetchRoles,
  };
}