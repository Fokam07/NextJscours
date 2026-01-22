// frontend/hooks/useChat.js
'use client';

import { useState, useEffect } from 'react';

export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les messages de la conversation sélectionnée
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Erreur chargement messages');

        const data = await res.json();
        setMessages(data || []);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Envoyer un message
  const sendMessage = async (content) => {
    if (!conversationId || !content?.trim()) return;

    // Optimistic UI
    const optimisticMsg = {
      id: Date.now(),
      content: content.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Erreur envoi message');

      const { userMessage, assistantMessage } = await res.json();

      // Remplacer le message optimiste
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? userMessage : m)).concat(assistantMessage)
      );
    } catch (err) {
      setError(err.message);
      // Retirer le message optimiste en cas d'erreur
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  return {
    messages,
    sendMessage,
    loading,
    error,
  };
}