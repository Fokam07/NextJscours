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

  const createConversation = async (title = 'Nouvelle conversation') => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) throw new Error('Erreur création');

      const newConv = await response.json();
      setConversations(prev => [newConv, ...prev]);
      return newConv;
    } catch (err) {
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