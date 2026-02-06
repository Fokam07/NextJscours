// app/page.jsx ou components/HomePage.jsx
'use client';

import { useRef, useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';
import { useChat } from '../hooks/useChat';
import { marked } from 'marked';
import DOMpurify from 'dompurify';

export default function HomePage() {
  const [message, setMessage] = useState('');
  const {push}= useNavigate();
  const {sendAnonimousMessage, messages, loading} = useChat();
   const messagesEndRef = useRef(null);

  const handleSend =async () => {
    if (!message.trim()) return;
    console.log("Message envoyé:", message);
    setMessage('');
    await sendAnonimousMessage(message);
  };

  const onLoginClick = ()=>{
    push('login')
  }
  const onRegisterClick = ()=>{
    push('register')
  }

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
  
    const parseMessage = (text)=> {
      marked.setOptions({
        gfm: true,            // Support GitHub Markdown
        breaks: true,         // Conserve les sauts de lignes
        headerIds: false,     // Évite les IDs inutiles
        mangle: false         // Évite les caractères cassés
      });
      return DOMpurify.sanitize(marked.parse(text))
    };
  
    return (
      <div className="space-y-2 message-content-wrapper">
        {/* Texte du message */}
        {message.content && (
          <div dangerouslySetInnerHTML={{__html: parseMessage(message.content)}} className="prose dark:prose-invert max-w-none leading-relaxed">
          </div>
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
  
     

  

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Chat App</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={onLoginClick} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
            Se connecter
          </button>
          <button onClick={onRegisterClick} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition">
            S'inscrire
          </button>
        </div>
      </header>

      {(!messages.length>0) ?
       (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-4xl">💬</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur Chat App
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Discutez avec une IA intelligente propulsée par Gemini. 
            Posez vos questions, partagez des fichiers, et obtenez des réponses instantanées.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Conversations illimitées</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Support de fichiers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Historique sauvegardé</span>
            </div>
          </div>
        </div>
      </div>
      )
    
  
    :(
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      
  
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
          ): (
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
        </div>)};

      {/* Zone de saisie (fixe en bas) */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <button className="p-3 text-gray-500 hover:bg-gray-100 rounded-lg transition">
              <Paperclip size={20} />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Écrivez votre message... (Appuyez sur Entrée pour envoyer)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            Chat App peut faire des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  );
}