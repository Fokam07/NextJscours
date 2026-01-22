// frontend/hooks/useChat.js
'use client';

import { useState, useEffect } from 'react';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger l'historique au premier rendu
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/chat/history', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Impossible de charger l historique');

        const data = await res.json();
        setMessages(data || []);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des messages');
      }
    };

    loadHistory();
  }, []);

  const sendMessage = async (content) => {
    if (!content?.trim()) return;

    setIsLoading(true);
    setError(null);

    // Message utilisateur affiché immédiatement (optimistic update)
    const tempId = Date.now();
    const optimisticMsg = {
      id: tempId,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }

      const { userMessage, aiMessage } = await res.json();

      // Remplacer le message temporaire par la vraie version serveur + ajouter la réponse IA
      setMessages((prev) =>
        prev
          .map((m) => (m.id === tempId ? userMessage : m))
          .concat(aiMessage)
      );
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Impossible d’envoyer le message. Réessaie ?');
      // Option : retirer le message optimiste en cas d’échec
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}