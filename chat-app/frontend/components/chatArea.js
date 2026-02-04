// frontend/components/chatArea.js
import { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import ShareButtons from '@/frontend/services/shareButton';

export default function ChatArea({ conversationId, userId, onUpdateTitle }) {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { sendMessage, error, messages, loading } = useChat(conversationId, userId);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Générer un titre automatique après le premier message
  useEffect(() => {
    if (messages.length === 2 && onUpdateTitle) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        generateTitle(firstUserMessage.content);
      }
    }
  }, [messages.length]);

  const generateTitle = async (firstMessage) => {
    try {
      const res = await fetch('/api/conversations/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: firstMessage, conversationId })
      });
      
      if (res.ok) {
        const { title } = await res.json();
        onUpdateTitle?.(conversationId, title);
      }
    } catch (err) {
      console.error('Erreur génération titre:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && attachedFiles.length === 0) || loading || !conversationId) return;

    const userMessage = inputValue.trim();
    const files = attachedFiles;
    
    setInputValue('');
    setAttachedFiles([]);
    
    await sendMessage(userMessage, files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`Le fichier ${file.name} est trop volumineux (max 10 MB)`);
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      type: file.type,
      size: file.size
    }));
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleCameraCapture = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const renderMessageContent = (message) => {
  // Normalisation : on veut TOUJOURS un tableau (même vide)
  const attachments = Array.isArray(message.attachments)
    ? message.attachments
    : message.attachments && typeof message.attachments === 'string'
      ? safeParseAttachments(message.attachments)
      : [];

  const imageAttachments = attachments.filter(
    att => att && typeof att.type === 'string' && att.type.startsWith('image/')
  );

  const otherAttachments = attachments.filter(
    att => att && typeof att.type === 'string' && !att.type.startsWith('image/')
  );

  return (
    <div className="space-y-2">
      {/* Texte du message */}
      {message.content && (
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
      )}

      {/* Images attachées */}
      {imageAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {imageAttachments.map((attachment, idx) => (
            <div key={idx} className="relative group">
              <img
                src={attachment.url || attachment.preview || attachment.dataUrl}
                alt={attachment.name || 'Image jointe'}
                className="max-w-xs max-h-64 rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-md object-cover"
                onClick={() => {
                  const src = attachment.url || attachment.preview || attachment.dataUrl;
                  if (src) window.open(src, '_blank');
                }}
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Cliquer pour agrandir
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents / autres fichiers */}
      {otherAttachments.length > 0 && (
        <div className="space-y-2 mt-3">
          {otherAttachments.map((attachment, idx) => (
            <a
              key={idx}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] ${
                message.role === 'user'
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30'
                  : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                message.role === 'user' ? 'bg-white/20' : 'bg-blue-50'
              }`}>
                <svg className={`w-5 h-5 ${message.role === 'user' ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                  {attachment.name || 'Document'}
                </p>
                <p className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : '—'}
                </p>
              </div>
              <svg className={`w-5 h-5 ${message.role === 'user' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// Fonction helper pour parser en sécurité (à mettre juste au-dessus ou dans un util)
function safeParseAttachments(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Impossible de parser attachments :", value);
    return [];
  }
}

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="text-center">
          <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 animate-pulse">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Bienvenue !
          </h2>
          <p className="text-gray-500 text-lg">Sélectionnez ou créez une conversation</p>
          <p className="text-gray-400 text-sm mt-2">Propulsé par Groq AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Conversation
        </h2>
        <ShareButtons />
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-600">Commencez la conversation</p>
              <p className="text-sm mt-2 text-gray-400">Posez une question à Groq AI</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className="flex gap-3 max-w-[85%]">
                  {/* Avatar Assistant */}
                  {message.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-5 py-4 shadow-md transition-all hover:shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-100'
                    }`}
                  >
                    {renderMessageContent(message)}
                    <p
                      className={`text-xs mt-3 flex items-center gap-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Avatar Utilisateur */}
                  {message.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && messages.length > 0 && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="bg-white rounded-2xl px-5 py-4 shadow-md border border-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="border-t bg-white/80 backdrop-blur-xl p-6 shadow-lg">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          {/* Aperçu des fichiers attachés */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {attachedFiles.map((file, index) => (
                <div key={index} className="relative group animate-fadeIn">
                  {file.preview ? (
                    <div className="relative">
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-purple-200 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-xl border-2 border-purple-200 shadow-md">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 font-medium max-w-[120px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="ml-2 text-red-500 hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            {/* Input file caché */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx,.txt"
              capture="environment"
              multiple
              className="hidden"
            />

            {/* Boutons d'upload */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCameraCapture}
                className="p-3 text-gray-600 hover:bg-purple-50 rounded-xl transition-all border-2 border-transparent hover:border-purple-200"
                title="Prendre une photo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleFileUpload}
                className="p-3 text-gray-600 hover:bg-purple-50 rounded-xl transition-all border-2 border-transparent hover:border-purple-200"
                title="Joindre un fichier"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>

            {/* Input texte */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 placeholder-gray-400"
              disabled={loading}
            />

            {/* Bouton envoi */}
            <button
              type="submit"
              disabled={loading || (!inputValue.trim() && attachedFiles.length === 0)}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]"
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}