// app/page.jsx ou components/HomePage.jsx
'use client';

import { useState } from 'react';
import { Send, Paperclip, Menu, X } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {push}= useNavigate();

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Message envoyé:", message);
    setMessage('');
  };

  const onLoginClick = ()=>{
    push('login')
  }
  const onRegisterClick = ()=>{
    push('register')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Responsive */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
            <span className="text-white text-lg sm:text-xl font-bold">⚡</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chat App</h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-3">
          <button 
            onClick={onLoginClick} 
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Se connecter
          </button>
          <button 
            onClick={onRegisterClick} 
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
          >
            S'inscrire
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="flex flex-col p-4 space-y-2">
              <button 
                onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Se connecter
              </button>
              <button 
                onClick={() => { onRegisterClick(); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
              >
                S'inscrire
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Zone de bienvenue (centre) - Responsive */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 overflow-y-auto">
        <div className="text-center max-w-2xl w-full py-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <span className="text-3xl sm:text-4xl">💬</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Bienvenue sur Chat App
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Discutez avec une IA intelligente propulsée par Gemini. 
            Posez vos questions, partagez des fichiers, et obtenez des réponses instantanées.
          </p>
          
          {/* Features - Responsive Grid */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center text-sm text-gray-500 px-4">
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-green-500 text-lg">✓</span>
              <span>Conversations illimitées</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-500 text-lg">✓</span>
              <span>Support de fichiers</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <span className="text-purple-500 text-lg">✓</span>
              <span>Historique sauvegardé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de saisie (fixe en bas) - Responsive */}
      <div className="border-t border-gray-200 bg-white px-3 sm:px-6 py-3 sm:py-4 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 sm:gap-3">
            {/* Bouton pièce jointe - caché sur très petit mobile */}
            <button className="hidden xs:block p-2 sm:p-3 text-gray-500 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
              <Paperclip size={18} className="sm:w-5 sm:h-5" />
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
                placeholder="Écrivez votre message..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2 sm:mt-3 px-2">
            Chat App peut faire des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>

      <style jsx>{`
        /* Support pour le safe area sur iOS */
        .safe-area-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
        
        /* Breakpoint personnalisé pour très petits écrans */
        @media (min-width: 380px) {
          .xs\\:block {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}