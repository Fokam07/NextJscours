// frontend/components/chatArea.js
import { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import ShareButtons from '@/frontend/services/shareButton';
import { marked } from 'marked';
import DOMpurify from 'dompurify';

export default function ChatArea({ conversationId, userId, onUpdateTitle, onOpenSidebar }) {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const attachMenuRef = useRef(null);
  const modelMenuRef = useRef(null);

  const { sendMessage, error, messages, loading } = useChat(conversationId, userId);

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'fr-FR';

        recognitionInstance.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setInputValue(prev => prev + finalTranscript);
          }
        };

        recognitionInstance.onerror = (event) => {
          console.error('Erreur de reconnaissance vocale:', event.error);
          setIsRecording(false);
          
          if (event.error === 'not-allowed') {
            alert('Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.');
          }
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setShowModelMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Générer un titre automatique après le premier message
  useEffect(() => {
    if (messages.length === 2 && onUpdateTitle) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        generateTitle(firstUserMessage.content);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    await sendMessage(userMessage, files, selectedModel);
  };

  const handleFileSelect = (e, type = 'file') => {
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
    setShowAttachMenu(false);
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

  const handleAttachClick = (type) => {
    if (type === 'image') {
      imageInputRef.current.click();
    } else if (type === 'document') {
      fileInputRef.current.click();
    } else if (type === 'camera') {
      imageInputRef.current.setAttribute('capture', 'environment');
      imageInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  // Fonction pour gérer le microphone
  const handleMicrophoneToggle = () => {
    if (!recognition) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur. Essayez Chrome, Edge ou Safari.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Erreur lors du démarrage:', error);
        setIsRecording(false);
      }
    }
  };

  // Fonction pour parser les attachments de manière sécurisée
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

  const renderMessageContent = (message) => {
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
        {message.content && (
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        )}

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
      {/* Header - Responsive avec bouton hamburger */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 shadow-sm">
        {/* Bouton Hamburger (Mobile seulement) */}
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Ouvrir le menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex-1 min-w-0 truncate">
          Conversation
        </h2>
        
        <div className="flex-shrink-0">
          <ShareButtons 
            conversationId={conversationId}
            userId={userId}
            title="Découvrez cette conversation"
          />
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
              <p className="text-sm mt-2 text-gray-400">Posez une question à gemini AI</p>
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
                  {message.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-5 py-4 shadow-md transition-all hover:shadow-lg p-3 bg-gray-100 max-w-[80%] ${
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

      {/* 🔥 ZONE DE SAISIE STYLE GROK - Barre arrondie comme l'image */}
      <div className="bg-[#212121] border-t border-gray-800">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <form onSubmit={handleSendMessage}>
            {/* Aperçu des fichiers attachés */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.preview ? (
                      <div className="relative">
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-gray-300 max-w-[80px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-gray-500 hover:text-white text-sm"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Barre de saisie style Grok - Arrondie complète */}
            <div className="flex items-center gap-2 sm:gap-3 bg-[#2a2a2a] rounded-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-700 hover:border-gray-600 focus-within:border-gray-500 transition-colors">
              {/* Input file cachés */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => handleFileSelect(e, 'document')}
                accept="application/pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
              />
              <input
                ref={imageInputRef}
                type="file"
                onChange={(e) => handleFileSelect(e, 'image')}
                accept="image/*"
                multiple
                className="hidden"
              />

              {/* Bouton pièce jointe */}
              <div className="relative" ref={attachMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="text-gray-400 hover:text-gray-200 transition-colors p-1.5 hover:bg-gray-700 rounded-lg"
                  title="Joindre un fichier"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Menu déroulant */}
                {showAttachMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[200px] z-50">
                    <button
                      type="button"
                      onClick={() => handleAttachClick('image')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                    >
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-200 text-sm">Téléverser une image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAttachClick('document')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                    >
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-200 text-sm">Téléverser un document</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAttachClick('camera')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                    >
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-200 text-sm">Prendre une photo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea - Style Grok exact avec retour à la ligne */}
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="How can Grok help?"
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm sm:text-[15px] resize-none overflow-hidden"
                disabled={loading}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />

              {/* Boutons à droite - Style Grok */}
              <div className="flex items-center gap-2">
                {/* Sélecteur de modèle IA */}
                <div className="relative" ref={modelMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="text-gray-300 hover:text-white transition-colors hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-700 rounded-lg text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{selectedModel === 'gemini' ? 'Gemini 2.5' : 'Llama 3.3'}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Menu déroulant modèles */}
                  {showModelMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[220px] z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel('gemini');
                          setShowModelMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left ${
                          selectedModel === 'gemini' ? 'bg-gray-700' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="text-gray-200 font-medium text-sm">Gemini 2.5 Flash</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 ml-7">Rapide et polyvalent</p>
                        </div>
                        {selectedModel === 'gemini' && (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel('llama');
                          setShowModelMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left ${
                          selectedModel === 'llama' ? 'bg-gray-700' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-gray-200 font-medium text-sm">Llama 3.3 70B</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 ml-7">Puissant et précis</p>
                        </div>
                        {selectedModel === 'llama' && (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Bouton micro */}
                <button
                  type="button"
                  onClick={handleMicrophoneToggle}
                  className={`transition-all p-1.5 sm:p-2 rounded-full ${
                    isRecording 
                      ? 'bg-red-600 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={isRecording ? "Arrêter l'enregistrement" : "Commande vocale"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
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