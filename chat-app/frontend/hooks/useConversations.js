import { useState, useEffect } from 'react';

export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/conversations', {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) throw new Error('Erreur lors du chargement');

      const data = await response.json();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  /**
   * ✅ CORRECTION : Créer une conversation avec un rôle optionnel
   * @param {string} roleId - ID du rôle à appliquer (optionnel)
   * @param {string} title - Titre de la conversation (optionnel)
   */
  const createConversation = async (roleId = null, title = 'Nouvelle conversation') => {
    try {
      console.log('[useConversations] Création conversation avec roleId:', roleId);
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ 
          title,
          roleId // ✅ Passer le roleId au backend
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur création');
      }

      const newConv = await response.json();
      console.log('[useConversations] ✅ Conversation créée:', newConv.id);
      
      setConversations(prev => [newConv, ...prev]);
      return newConv;
    } catch (err) {
      console.error('[useConversations] Erreur:', err);
      setError(err.message);
      return null;
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) throw new Error('Erreur suppression');

      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    conversations,
    loading,
    error,
    createConversation,
    deleteConversation,
    refreshConversations: fetchConversations,
  };
}