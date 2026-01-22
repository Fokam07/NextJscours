// frontend/hooks/useConversations.js
'use client';

import { useState, useEffect } from 'react';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger toutes les conversations de l'utilisateur
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Erreur chargement conversations');

      const data = await res.json();
      setConversations(data || []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Créer une nouvelle conversation
  const createConversation = async (title = 'Nouvelle conversation') => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Erreur création conversation');

      const newConv = await res.json();
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversationId(newConv.id);
      return newConv;
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    }
  };

  // Supprimer une conversation
  const deleteConversation = async (conversationId) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Erreur suppression');

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));

      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    createConversation,
    deleteConversation,
    loading,
    error,
    refresh: fetchConversations,
  };
}