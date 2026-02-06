// frontend/hooks/useChat.js
'use client';

import { useState, useEffect } from 'react';

export function useChat(conversationId, userId) {
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
        const res = await fetch(`/api/conversations/${conversationId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erreur chargement messages');
        }

        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Envoyer un message avec support des fichiers et sélection du modèle
  const sendMessage = async (content, files = [], selectedModel = 'gemini') => {
    setLoading(true);
    setError(null);
    if (!conversationId || (!content?.trim() && files.length === 0)) {
      setLoading(false);
      return;
    }

    // Optimistic UI - Message utilisateur
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      content: content?.trim() || '',
      role: 'user',
      createdAt: new Date().toISOString(),
      attachments: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        preview: f.preview
      }))
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Préparer FormData pour l'upload de fichiers
      const formData = new FormData();
      formData.append('content', content?.trim() || '');
      formData.append('selectedModel', selectedModel); // Ajouter le modèle sélectionné
      
      // Ajouter les fichiers
      files.forEach((fileObj) => {
        formData.append('files', fileObj.file);
      });

      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'x-user-id': userId,
        },
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur envoi message');
      }

      const { userMessage, assistantMessage } = await res.json();

      // Remplacer le message optimiste par les vrais messages
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== optimisticMsg.id)
          .concat([userMessage, assistantMessage])
      );
    } catch (err) {
      setError(err.message);
      // Retirer le message optimiste en cas d'erreur
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setLoading(false);
    }
  };
  
  const sendAnonimousMessage = async (content, files = []) => {
    setLoading(true);
    setError(null);
    if ( !content?.trim()) {
      setLoading(false);
      return;
    }

    // Optimistic UI - Message utilisateur
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      content: content?.trim() || '',
      role: 'user',
      createdAt: new Date().toISOString(),
      attachments: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        preview: f.preview
      }))
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Préparer FormData pour l'upload de fichiers
      const formData = new FormData();
      formData.append('content', content?.trim() || '');
      
      // Ajouter les fichiers
      files.forEach((fileObj) => {
        formData.append('files', fileObj.file);
      });

      const res = await fetch(`/api/conversations/-1/messages`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur envoi message');
      }

      const { userMessage, assistantMessage } = await res.json();

      // Remplacer le message optimiste par les vrais messages
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== optimisticMsg.id)
          .concat([userMessage, assistantMessage])
      );
    } catch (err) {
      setError(err.message);
      // Retirer le message optimiste en cas d'erreur
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    sendAnonimousMessage,
    loading,
    error,
  };
}