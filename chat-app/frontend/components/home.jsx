// app/page.jsx ou components/HomePage.jsx - Thème Overlord / Nazarick
'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, Menu, X } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';
import { useChat } from '../hooks/useChat';
import { marked } from 'marked';
import DOMpurify from 'dompurify';

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { push } = useNavigate();
  const { sendAnonymousMessage, messages, loading } = useChat(); // Correction typo: sendAnonimousMessage → sendAnonymousMessage
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const handleSend = async () => {
    if (!message.trim() && attachedFiles.length === 0) return;
    console.log("Message envoyé:", message);
    await sendAnonymousMessage(message, attachedFiles);
    setMessage('');
    setAttachedFiles([]);
  };

  const onLoginClick = () => {
    push('login');
  };

  const onRegisterClick = () => {
    push('register');
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

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const formatMessage = (content) => {
    if (!content) return '';
    const rawHtml = marked(content);
    return DOMpurify.sanitize(rawHtml);
  };

  // Fonction pour parser attachments en sécurité
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
    // Normalisation des attachments
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
      <div className="space-y-3 message-content-wrapper">
        {/* Texte du message */}
        {message.content && (
          <div
            className="prose prose-invert max-w-none prose-p:my-2 prose-li:my-1 prose-headings:text-[hsl(42,50%,54%)] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide prose-code:text-[hsl(142,70%,55%)] prose-code:bg-[hsl(260,25%,7%)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-a:text-[hsl(42,50%,60%)] hover:prose-a:text-[hsl(42,50%,70%)]"
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
        )}

        {/* Images attachées */}
        {imageAttachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {imageAttachments.map((attachment, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={attachment.url || attachment.preview || attachment.dataUrl}
                  alt={attachment.name || 'Image jointe'}
                  className="max-w-xs max-h-64 rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(139,0,0,0.2)] object-cover border border-[hsl(260,15%,14%)]"
                  onClick={() => {
                    const src = attachment.url || attachment.preview || attachment.dataUrl;
                    if (src) window.open(src, '_blank');
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-[hsl(260,20%,10%)]/80 backdrop-blur-sm text-[hsl(42,30%,82%)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Agrandir
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documents / autres fichiers */}
        {otherAttachments.length > 0 && (
          <div className="space-y-3 mt-3">
            {otherAttachments.map((attachment, idx) => (
              <a
                key={idx}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] border border-[hsl(260,15%,14%)] bg-[hsl(260,20%,10%)] hover:bg-[hsl(260,15%,14%)] text-[hsl(42,30%,82%)]`}
              >
                <div className="p-2 rounded-lg bg-[hsl(260,15%,14%)]">
                  <svg className="w-5 h-5 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.name || 'Document'}
                  </p>
                  <p className="text-xs text-[hsl(42,30%,65%)]">
                    {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : '—'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-[hsl(42,30%,65%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[hsl(260,25%,7%)] to-[hsl(260,20%,10%)] relative overflow-hidden">
      {/* Motif de fond subtil */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(42,50%,54%) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="bg-[hsl(260,20%,10%)] border-b border-[hsl(260,15%,14%)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[hsl(0,60%,30%)] to-[hsl(0,60%,38%)] rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,0,0,0.3)]">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(42,50%,70%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[hsl(42,50%,54%)] tracking-wide uppercase">Nazarick Chat</h1>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-3 sm:gap-4">
          <button
            onClick={onLoginClick}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[hsl(0,60%,30%)] to-[hsl(0,60%,35%)] hover:from-[hsl(0,60%,35%)] hover:to-[hsl(0,60%,40%)] text-[hsl(42,50%,70%)] rounded-lg transition-all shadow-[0_0_15px_rgba(139,0,0,0.2)] active:scale-95 text-sm uppercase tracking-wide"
          >
            Connexion
          </button>
          <button
            onClick={onRegisterClick}
            className="px-4 sm:px-6 py-2 bg-[hsl(260,20%,10%)] hover:bg-[hsl(260,15%,14%)] text-[hsl(42,30%,82%)] rounded-lg transition-all border border-[hsl(260,15%,14%)] active:scale-95 text-sm uppercase tracking-wide"
          >
            Inscription
          </button>
        </nav>

        {/* Menu Mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[hsl(42,30%,65%)] hover:text-[hsl(42,30%,82%)] hover:bg-[hsl(260,15%,14%)] rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Menu Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[60px] right-4 bg-[hsl(260,20%,10%)] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-[hsl(260,15%,14%)] py-2 z-50">
          <button
            onClick={onLoginClick}
            className="w-full px-6 py-3 hover:bg-[hsl(260,15%,14%)] text-[hsl(42,30%,82%)] text-left text-sm uppercase tracking-wide"
          >
            Connexion
          </button>
          <button
            onClick={onRegisterClick}
            className="w-full px-6 py-3 hover:bg-[hsl(260,15%,14%)] text-[hsl(42,30%,82%)] text-left text-sm uppercase tracking-wide"
          >
            Inscription
          </button>
        </div>
      )}

      {messages.length === 0 && !loading ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-[hsl(0,60%,35%,0.15)] rounded-2xl flex items-center justify-center border border-[hsl(0,60%,35%,0.25)] shadow-[0_0_20px_rgba(139,0,0,0.2)]">
            <svg className="w-14 h-14 text-[hsl(42,50%,54%)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"/>
            </svg>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[hsl(42,50%,54%)] tracking-wider uppercase">
              Bienvenue à Nazarick
            </h2>
            <p className="text-[hsl(42,30%,65%)] text-base">
              Commencez votre audience avec le Sorcier Suprême<br/>
              ou connectez-vous pour plus de pouvoirs
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-8">
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[hsl(42,50%,54%,0.5)] to-transparent"></div>
            <div className="w-3 h-3 border-2 border-[hsl(42,50%,54%)] rotate-45"></div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[hsl(42,50%,54%,0.5)] to-transparent"></div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar relative z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
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
                  {renderMessageContent(msg)}
                  <p className="text-xs mt-3 text-[hsl(42,30%,65%)] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(42,50%,54%)] to-[hsl(42,45%,60%)] flex items-center justify-center flex-shrink-0 text-[hsl(260,25%,7%)] font-bold text-lg shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    {msg.userId?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 justify-start animate-fadeIn">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(0,60%,35%)] to-[hsl(0,60%,40%)] flex items-center justify-center shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-[hsl(0,50%,40%,0.3)]">
                  <svg className="w-6 h-6 text-[hsl(42,50%,70%)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"/>
                  </svg>
                </div>
                <div className="bg-[hsl(260,20%,10%)] rounded-2xl rounded-tl-sm px-5 py-4 border border-[hsl(260,15%,14%)]">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-[hsl(42,50%,54%)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[hsl(42,50%,54%)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[hsl(42,50%,54%)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="border-t border-[hsl(260,15%,14%)] bg-[hsl(260,25%,7%)] relative z-10">
        <div className="max-w-5xl mx-auto p-4">
          {/* Fichiers attachés */}
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

          {/* Input caché pour fichiers */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            multiple
          />

          {/* Formulaire */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
            <div className="bg-[hsl(260,20%,10%)] rounded-2xl border border-[hsl(260,15%,14%)] focus-within:border-[hsl(42,50%,54%,0.3)] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-end gap-3 px-4 py-3">
              {/* Bouton attachment */}
              <button
                type="button"
                onClick={handleFileUpload}
                className="text-[hsl(42,50%,54%)] hover:text-[hsl(42,45%,60%)] transition-colors p-1.5 hover:bg-[hsl(42,50%,54%,0.08)] rounded-lg"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Textarea */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Posez votre question au Sorcier Suprême..."
                className="flex-1 bg-transparent text-[hsl(42,30%,82%)] placeholder-[hsl(260,10%,35%)] focus:outline-none text-sm sm:text-[15px] resize-none overflow-hidden"
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              {/* Bouton envoyer */}
              <button
                type="submit"
                disabled={loading || (!message.trim() && attachedFiles.length === 0)}
                className="bg-gradient-to-r from-[hsl(0,60%,30%)] to-[hsl(0,60%,35%)] hover:from-[hsl(0,60%,35%)] hover:to-[hsl(0,60%,40%)] disabled:from-[hsl(260,15%,14%)] disabled:to-[hsl(260,15%,14%)] text-[hsl(42,50%,70%)] disabled:text-[hsl(260,10%,35%)] p-2 rounded-lg transition-all disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,0,0,0.2)] disabled:shadow-none active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>

          <p className="text-xs text-[hsl(42,30%,65%)] text-center mt-3 px-2">
            Le Sorcier Suprême peut commettre des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: hsl(260,25%,7%); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(42,50%,54%,0.2); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(42,50%,54%,0.3); }
      `}</style>
    </div>
  );
}