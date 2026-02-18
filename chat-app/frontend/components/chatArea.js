// frontend/components/chatArea.js - Thème Overlord
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

  const handleMicrophoneToggle = () => {
    if (!recognition) {
      alert('La reconnaissance vocale n\'est pas supportée sur ce navigateur.');
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
        console.error('Erreur démarrage reconnaissance:', error);
        alert('Impossible de démarrer la reconnaissance vocale.');
      }
    }
  };

  const formatMessage = (content) => {
    if (!content) return '';
    const rawHtml = marked(content);
    return DOMpurify.sanitize(rawHtml);
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[hsl(260,25%,7%)] to-[hsl(260,20%,10%)]">
        <div className="text-center space-y-6 p-8">
          <div className="w-24 h-24 mx-auto bg-[hsl(0,60%,35%,0.15)] rounded-2xl flex items-center justify-center border border-[hsl(0,60%,35%,0.25)]">
            <svg className="w-14 h-14 text-[hsl(42,50%,54%)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"/>
            </svg>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[hsl(42,50%,54%)] tracking-wider uppercase">
              Bienvenue à Nazarick
            </h2>
            <p className="text-[hsl(42,30%,65%)] text-base">
              Sélectionnez une conversation ou créez-en une nouvelle<br/>
              pour commencer votre audience avec le Sorcier Suprême
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-8">
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[hsl(42,50%,54%,0.5)] to-transparent"></div>
            <div className="w-3 h-3 border-2 border-[hsl(42,50%,54%)] rotate-45"></div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[hsl(42,50%,54%,0.5)] to-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-[hsl(260,25%,7%)] to-[hsl(260,20%,10%)] relative overflow-hidden">
      {/* Motif de fond subtil */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 2px 2px, hsl(42,50%,54%) 1px, transparent 0)`,
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Header avec bouton share */}
      <div className="relative z-20 bg-[hsl(260,18%,9%)] border-b border-[hsl(260,15%,14%)] px-4 py-3 flex items-center justify-between">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="md:hidden text-[hsl(42,50%,54%)] p-1.5 rounded-lg hover:bg-[hsl(260,15%,18%)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex-1 min-w-0 pl-2 md:pl-0">
          <h2 className="text-[hsl(42,50%,70%)] font-semibold text-lg truncate">
            Conversation
          </h2>
        </div>

        <ShareButtons 
          conversationId={conversationId}
          userId={userId}
        />
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar relative z-10">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center py-12 space-y-6">
            <div className="w-20 h-20 mx-auto bg-[hsl(0,60%,35%,0.15)] rounded-xl flex items-center justify-center border border-[hsl(0,60%,35%,0.25)]">
              <svg className="w-12 h-12 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[hsl(42,50%,54%)] tracking-wide uppercase mb-2">
                Nouvelle Audience
              </h3>
              <p className="text-[hsl(42,30%,65%)] text-sm">
                Posez votre première question au Sorcier Suprême
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 animate-fadeIn ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(0,60%,35%)] to-[hsl(0,60%,40%)] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-[hsl(0,50%,40%,0.3)]">
                  <svg className="w-6 h-6 text-[hsl(42,50%,70%)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"/>
                  </svg>
                </div>
              )}

              <div
                className={`max-w-3xl ${
                  msg.role === 'user'
                    ? 'bg-[hsl(0,60%,30%)] text-[hsl(42,50%,70%)] rounded-2xl rounded-tr-sm border border-[hsl(0,50%,40%,0.3)] shadow-[0_0_15px_rgba(139,0,0,0.2)]'
                    : 'bg-[hsl(260,20%,10%)] text-[hsl(42,30%,82%)] rounded-2xl rounded-tl-sm border border-[hsl(260,15%,14%)]'
                } px-5 py-4`}
              >
                <div
                  className="prose prose-invert max-w-none prose-p:my-2 prose-li:my-1 prose-headings:text-[hsl(42,50%,54%)] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide prose-code:text-[hsl(142,70%,55%)] prose-code:bg-[hsl(260,25%,7%)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-a:text-[hsl(42,50%,60%)] hover:prose-a:text-[hsl(42,50%,70%)]"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(42,50%,54%)] to-[hsl(42,45%,60%)] flex items-center justify-center flex-shrink-0 text-[hsl(260,25%,7%)] font-bold text-lg shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  {userId?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-4 justify-start animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(0,60%,35%)] to-[hsl(0,60%,40%)] flex items-center justify-center shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-[hsl(0,50%,40%,0.3)]">
              <svg className="w-6 h-6 text-[hsl(42,50%,70%)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"/>
              </svg>
            </div>
            <div className="bg-[hsl(260,20%,10%)] rounded-2xl rounded-tl-sm px-5 py-4 border border-[hsl(260,15%,14%)]">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-[hsl(42,50%,54%)] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-[hsl(42,50%,54%)] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-[hsl(42,50%,54%)] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto bg-[hsl(0,60%,35%,0.15)] border border-[hsl(0,60%,35%,0.3)] rounded-xl p-4 flex items-start gap-3">
            <svg className="w-6 h-6 text-[hsl(0,50%,60%)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-[hsl(0,50%,60%)] uppercase tracking-wide mb-1">Erreur</p>
              <p className="text-sm text-[hsl(42,30%,65%)]">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t border-[hsl(260,15%,14%)] bg-[hsl(260,25%,7%)] relative z-10">
        <div className="max-w-5xl mx-auto p-4">
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="relative bg-[hsl(260,20%,10%)] rounded-lg border border-[hsl(260,15%,14%)] p-2 flex items-center gap-2 group"
                >
                  {file.preview ? (
                    <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-[hsl(260,15%,14%)] rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="text-xs text-[hsl(42,30%,65%)] max-w-[120px] truncate">
                    {file.name}
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="ml-2 p-1 rounded-full bg-[hsl(0,60%,35%,0.2)] hover:bg-[hsl(0,60%,35%,0.4)] text-[hsl(0,50%,60%)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
            multiple
            accept="image/*"
          />

          <form onSubmit={handleSendMessage} className="relative">
            <div className="bg-[hsl(260,20%,10%)] rounded-2xl border border-[hsl(260,15%,14%)] focus-within:border-[hsl(42,50%,54%,0.3)] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-end gap-3 px-4 py-3">
              <div className="relative" ref={attachMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="text-[hsl(42,50%,54%)] hover:text-[hsl(42,45%,60%)] transition-colors p-1.5 hover:bg-[hsl(42,50%,54%,0.08)] rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-[hsl(260,20%,10%)] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-[hsl(260,15%,14%)] py-2 min-w-[220px] z-50">
                    <button
                      type="button"
                      onClick={() => handleAttachClick('image')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(260,15%,14%)] transition-colors text-left"
                    >
                      <svg className="w-5 h-5 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[hsl(42,30%,82%)] text-sm font-medium">Téléverser une image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAttachClick('document')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(260,15%,14%)] transition-colors text-left"
                    >
                      <svg className="w-5 h-5 text-[hsl(142,70%,45%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[hsl(42,30%,82%)] text-sm font-medium">Téléverser un document</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAttachClick('camera')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(260,15%,14%)] transition-colors text-left"
                    >
                      <svg className="w-5 h-5 text-[hsl(270,50%,50%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[hsl(42,30%,82%)] text-sm font-medium">Prendre une photo</span>
                    </button>
                  </div>
                )}
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Posez votre question au Sorcier Suprême..."
                className="flex-1 bg-transparent text-[hsl(42,30%,82%)] placeholder-[hsl(260,10%,35%)] focus:outline-none text-sm sm:text-[15px] resize-none overflow-hidden"
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

              <div className="flex items-center gap-2">
                <div className="relative" ref={modelMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="text-[hsl(42,30%,65%)] hover:text-[hsl(42,30%,82%)] transition-colors hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[hsl(260,15%,14%)] rounded-lg text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{selectedModel === 'gemini' ? 'Gemini' : 'Llama'}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showModelMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-[hsl(260,20%,10%)] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-[hsl(260,15%,14%)] py-2 min-w-[240px] z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel('gemini');
                          setShowModelMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(260,15%,14%)] transition-colors text-left ${
                          selectedModel === 'gemini' ? 'bg-[hsl(260,15%,14%)]' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="text-[hsl(42,30%,82%)] font-bold text-sm uppercase tracking-wide">Gemini 2.5</span>
                          </div>
                          <p className="text-xs text-[hsl(42,30%,65%)] mt-0.5 ml-7">Rapide et polyvalent</p>
                        </div>
                        {selectedModel === 'gemini' && (
                          <svg className="w-4 h-4 text-[hsl(142,70%,45%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(260,15%,14%)] transition-colors text-left ${
                          selectedModel === 'llama' ? 'bg-[hsl(260,15%,14%)]' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[hsl(270,50%,50%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-[hsl(42,30%,82%)] font-bold text-sm uppercase tracking-wide">Llama 3.3</span>
                          </div>
                          <p className="text-xs text-[hsl(42,30%,65%)] mt-0.5 ml-7">Puissant et précis</p>
                        </div>
                        {selectedModel === 'llama' && (
                          <svg className="w-4 h-4 text-[hsl(142,70%,45%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleMicrophoneToggle}
                  className={`transition-all p-1.5 sm:p-2 rounded-lg ${
                    isRecording 
                      ? 'bg-[hsl(0,60%,35%)] text-[hsl(42,50%,70%)] animate-pulse shadow-[0_0_15px_rgba(139,0,0,0.4)]' 
                      : 'text-[hsl(42,30%,65%)] hover:text-[hsl(42,30%,82%)] hover:bg-[hsl(260,15%,14%)]'
                  }`}
                  title={isRecording ? "Arrêter l'enregistrement" : "Commande vocale"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <button
                  type="submit"
                  disabled={loading || (!inputValue.trim() && attachedFiles.length === 0)}
                  className="bg-gradient-to-r from-[hsl(0,60%,30%)] to-[hsl(0,60%,35%)] hover:from-[hsl(0,60%,35%)] hover:to-[hsl(0,60%,40%)] disabled:from-[hsl(260,15%,14%)] disabled:to-[hsl(260,15%,14%)] text-[hsl(42,50%,70%)] disabled:text-[hsl(260,10%,35%)] p-2 rounded-lg transition-all disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,0,0,0.2)] disabled:shadow-none active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[hsl(42,50%,54%,0.3)] border-t-[hsl(42,50%,54%)] rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
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

        .custom-scrollbar::-webkit-scrollbar { 
          width: 6px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: hsl(260,25%,7%); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: hsl(42,50%,54%,0.2); 
          border-radius: 20px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: hsl(42,50%,54%,0.3); 
        }
      `}</style>
    </div>
  );
}