import { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

export default function ChatArea({ conversationId, userId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Charger les messages de la conversation
  useEffect(() => {
    if (!conversationId || !userId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          headers: { 'x-user-id': userId },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        } else {
          throw new Error('Erreur lors du chargement des messages');
        }
      } catch (error) {
        console.error('Erreur chargement messages:', error);
        setError('Impossible de charger les messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [conversationId, userId]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus automatique sur l'input
  useEffect(() => {
    if (conversationId) {
      inputRef.current?.focus();
    }
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || !conversationId) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);
    setError(null);

    // Ajouter immédiatement le message utilisateur
    const tempUserMsg = {
      id: Date.now(),
      content: userMessage,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          conversationId,
          content: userMessage,
        }),
      });

      if (!response.ok) throw new Error('Erreur envoi message');

      const { userMessage: savedUserMsg, assistantMessage } = await response.json();

      // Remplacer le message temporaire et ajouter la réponse
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        savedUserMsg,
        assistantMessage,
      ]);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Désolé, une erreur s\'est produite. Veuillez réessayer.');
      // Retirer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Vraiment effacer toute la conversation ?')) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      });
      
      if (!res.ok) throw new Error('Erreur suppression');
      
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Impossible d\'effacer la conversation');
    }
  };

  // État vide - pas de conversation sélectionnée
  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Bienvenue !</h2>
          <p className="text-gray-500">Sélectionnez ou créez une conversation pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header avec bouton clear */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Conversation</h2>
        <button
          onClick={handleClearChat}
          disabled={messages.length === 0 || loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
          Effacer
        </button>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-lg">Commencez la conversation</p>
              <p className="text-sm mt-2">Posez une question à votre assistant IA</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-center">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}