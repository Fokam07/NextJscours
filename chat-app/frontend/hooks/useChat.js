// frontend/hooks/useChat.js
'use client';

import { useState, useEffect } from 'react';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger l'historique au montage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/chat/history');
        
        if (!res.ok) {
          throw new Error(`Erreur chargement historique : ${res.status}`);
        }

        const data = await res.json();

        // Protection : on filtre les éléments invalides dès le chargement
        const validMessages = Array.isArray(data)
          ? data.filter(msg => msg && typeof msg === 'object' && msg.id != null)
          : [];

        setMessages(validMessages);
      } catch (err) {
        console.error('Erreur chargement historique :', err);
        setError('Impossible de charger l’historique');
      }
    };

    loadHistory();
  }, []);

  const sendMessage = async (content) => {
    if (!content?.trim()) return;

    setIsLoading(true);
    setError(null);

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
        throw new Error(`Erreur serveur : ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const { userMessage, aiMessage } = data;

      // Debug rapide (à retirer plus tard)
      console.log('Réponse API reçue :', { userMessage, aiMessage });

      // Protection : si un des deux est absent ou invalide → on ne plante pas
      let newMessages = [...messages];

      // On remplace le message temporaire seulement s'il existe vraiment
      if (userMessage && typeof userMessage === 'object' && userMessage.id != null) {
        newMessages = newMessages.map((m) =>
          m.id === tempId ? userMessage : m
        );
      } else {
        console.warn('userMessage invalide reçu du serveur', userMessage);
        // On garde le message temporaire dans ce cas (ou on le supprime selon stratégie)
        // Ici on le garde pour ne pas perdre le message utilisateur
      }

      // On ajoute la réponse IA seulement si elle est valide
      if (aiMessage && typeof aiMessage === 'object' && aiMessage.id != null) {
        newMessages = [...newMessages, aiMessage];
      } else {
        console.warn('aiMessage invalide reçu du serveur', aiMessage);
        // Option : ajouter un message d'erreur visible
        newMessages = [
          ...newMessages,
          {
            id: Date.now() + 1,
            role: 'system',
            content: 'Erreur : impossible de recevoir la réponse de l’IA',
            createdAt: new Date().toISOString(),
          },
        ];
      }

      setMessages(newMessages);
    } catch (err) {
      console.error('Erreur lors de l’envoi :', err);
      setError('Impossible d’envoyer le message. Réessaie ?');

      // En cas d’erreur → on retire le message temporaire
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