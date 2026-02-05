// app/page.jsx ou components/HomePage.jsx
'use client';

import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';

export default function HomePage() {
  const [message, setMessage] = useState('');
  const {push}= useNavigate();

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Message envoyé:", message);
    // Rediriger vers une conversation ou créer une nouvelle
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

      {/* Zone de bienvenue (centre) */}
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