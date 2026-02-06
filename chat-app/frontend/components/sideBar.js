// frontend/components/sideBar.js
'use client';

import { useState } from 'react';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSignOut,
  user,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const handleDelete = (conversationId) => {
    onDeleteConversation(conversationId);
    setShowDeleteConfirm(null);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  // Filtrer les conversations par recherche
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouper les conversations par date
  const groupConversationsByDate = (conversations) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: []
    };

    conversations.forEach(conv => {
      const convDate = new Date(conv.updatedAt);
      const convDay = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

      if (convDay.getTime() === today.getTime()) {
        groups.today.push(conv);
      } else if (convDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(conv);
      } else if (convDate >= lastWeek) {
        groups.lastWeek.push(conv);
      } else if (convDate >= lastMonth) {
        groups.lastMonth.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const groupedConversations = groupConversationsByDate(filteredConversations);

  const renderConversationGroup = (title, conversations) => {
    if (conversations.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className={`text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 transition-opacity ${
          !isExpanded && !isPinned ? 'opacity-0' : 'opacity-100'
        }`}>
          {title}
        </h3>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative rounded-xl transition-all duration-200 ${
                currentConversationId === conv.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                  : 'hover:bg-gray-800/80'
              }`}
            >
              <button
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left p-3 flex items-start gap-3 ${
                  !isExpanded && !isPinned ? 'justify-center pr-3' : 'pr-10'
                }`}
                title={!isExpanded && !isPinned ? conv.title : ''}
              >
                <div className={`flex-shrink-0 ${
                  !isExpanded && !isPinned ? 'mt-0' : 'mt-0.5'
                } ${currentConversationId === conv.id ? 'text-white' : 'text-gray-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                
                {(isExpanded || isPinned) && (
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate text-sm leading-5 ${
                      currentConversationId === conv.id ? 'text-white' : 'text-gray-200'
                    }`}>
                      {conv.title}
                    </p>
                    <p className={`text-xs mt-1 ${
                      currentConversationId === conv.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(conv.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </button>

              {/* Bouton supprimer - visible seulement si étendu */}
              {(isExpanded || isPinned) && (
                <button
                  onClick={() => setShowDeleteConfirm(conv.id)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 rounded-lg transition-all ${
                    currentConversationId === conv.id
                      ? 'hover:bg-white/20'
                      : 'hover:bg-red-600/90'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {/* Confirmation suppression */}
              {showDeleteConfirm === conv.id && (isExpanded || isPinned) && (
                <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center gap-2 z-10 shadow-xl border border-gray-700">
                  <p className="text-xs text-center text-gray-200 font-medium">Supprimer ?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors shadow-md"
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                    >
                      Non
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col h-screen shadow-2xl border-r border-gray-800 transition-all duration-300 ${
        isExpanded || isPinned ? 'w-80' : 'w-20'
      }`}
      onMouseEnter={() => !isPinned && setIsExpanded(true)}
      onMouseLeave={() => !isPinned && setIsExpanded(false)}
    >
      {/* Header avec logo */}
      <div className="p-4 border-b border-gray-800/50">
        <div className={`flex items-center mb-4 ${!isExpanded && !isPinned ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {(isExpanded || isPinned) && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                Chat IA
              </h1>
              <p className="text-xs text-gray-400 whitespace-nowrap">Groq & Gemini Intelligence</p>
            </div>
          )}
        </div>

        <button
          onClick={onNewConversation}
          className={`w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] ${
            !isExpanded && !isPinned ? 'px-0' : 'px-4'
          }`}
          title={!isExpanded && !isPinned ? 'Nouvelle conversation' : ''}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {(isExpanded || isPinned) && <span>Nouvelle conversation</span>}
        </button>
      </div>

      {/* Barre de recherche - visible seulement si étendu */}
      {(isExpanded || isPinned) && (
        <div className="p-4 border-b border-gray-800/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 text-white placeholder-gray-500 px-4 py-2.5 pl-10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all border border-gray-700/50 focus:bg-gray-800"
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bouton de recherche version compacte */}
      {!isExpanded && !isPinned && (
        <div className="p-4 border-b border-gray-800/50 flex justify-center">
          <button
            className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors"
            title="Rechercher"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* Liste des conversations avec scroll personnalisé */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className={`text-center text-gray-500 mt-16 ${isExpanded || isPinned ? 'px-4' : 'px-2'}`}>
            {!isExpanded && !isPinned ? (
              <div className="w-10 h-10 mx-auto bg-gray-800/50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            ) : searchQuery ? (
              <>
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Aucune conversation trouvée</p>
                <p className="text-xs mt-2 text-gray-600">Essayez un autre terme</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Aucune conversation</p>
                <p className="text-xs mt-2 text-gray-600">Créez-en une</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {renderConversationGroup("Aujourd'hui", groupedConversations.today)}
            {renderConversationGroup("Hier", groupedConversations.yesterday)}
            {renderConversationGroup("7 derniers jours", groupedConversations.lastWeek)}
            {renderConversationGroup("30 derniers jours", groupedConversations.lastMonth)}
            {renderConversationGroup("Plus ancien", groupedConversations.older)}
          </div>
        )}
      </div>

      {/* Footer avec info utilisateur */}
      <div className="p-4 border-t border-gray-800/50 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
        <div className={`flex items-center ${!isExpanded && !isPinned ? 'flex-col gap-3' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${!isExpanded && !isPinned ? 'flex-col' : 'flex-1 min-w-0'}`}>
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-green-500/20 flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {(isExpanded || isPinned) && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-sm">
                  {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          
          <div className={`flex ${!isExpanded && !isPinned ? 'flex-col' : 'flex-row'} gap-2`}>
            {/* Bouton épingler */}
            <button
              onClick={togglePin}
              className={`p-2.5 rounded-xl transition-colors group ${
                isPinned ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-gray-800'
              }`}
              title={isPinned ? 'Désépingler' : 'Épingler'}
            >
              <svg 
                className={`w-5 h-5 transition-colors ${
                  isPinned ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            
            {/* Bouton déconnexion */}
            <button
              onClick={onSignOut}
              className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors group"
              title="Déconnexion"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Style pour le scrollbar personnalisé */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.5));
        }
      `}</style>
    </div>
  );
}