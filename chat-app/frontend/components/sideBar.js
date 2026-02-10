// frontend/components/sideBar.js
'use client';

import { useState, useEffect } from 'react';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSignOut,
  user,
  // Nouvelles props pour les rôles
  onSelectRole,
  currentRoleId,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  
  // Nouvel état pour les onglets
  const [activeTab, setActiveTab] = useState('history'); // 'history' ou 'roles'
  
  // États pour les rôles
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Charger les rôles au montage
  useEffect(() => {
    if (activeTab === 'roles') {
      loadRoles();
    }
  }, [activeTab]);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await fetch('/api/roles', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadRoles(); // Recharger la liste
        if (currentRoleId === roleId) {
          onSelectRole(null); // Désélectionner si c'était le rôle actif
        }
      }
    } catch (error) {
      console.error('Erreur suppression rôle:', error);
    }
  };

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

  // Filtrer les rôles par recherche
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
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

  // Grouper les rôles par source
  const groupRolesBySource = (roles) => {
    const groups = {
      system: [],
      owned: [],
      shared: []
    };

    roles.forEach(role => {
      if (role.source === 'system') {
        groups.system.push(role);
      } else if (role.source === 'owned') {
        groups.owned.push(role);
      } else if (role.source === 'shared') {
        groups.shared.push(role);
      }
    });

    return groups;
  };

  const groupedConversations = groupConversationsByDate(filteredConversations);
  const groupedRoles = groupRolesBySource(filteredRoles);

  const renderConversationGroup = (title, conversations) => {
    if (conversations.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
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
                className="w-full text-left p-3 flex items-start gap-3 pr-10"
              >
                <div className={`flex-shrink-0 mt-0.5 ${
                  currentConversationId === conv.id ? 'text-white' : 'text-gray-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                
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
              </button>

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

              {showDeleteConfirm === conv.id && (
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

  const renderRoleGroup = (title, roles, canDelete = false) => {
    if (roles.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          {title}
        </h3>
        <div className="space-y-1">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`group relative rounded-xl transition-all duration-200 ${
                currentRoleId === role.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                  : 'hover:bg-gray-800/80'
              }`}
            >
              <button
                onClick={() => onSelectRole(role.id)}
                className="w-full text-left p-3 flex items-start gap-3 pr-10"
              >
                <div className="flex-shrink-0 text-2xl mt-0.5">
                  {role.icon || '🤖'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate text-sm leading-5 ${
                    currentRoleId === role.id ? 'text-white' : 'text-gray-200'
                  }`}>
                    {role.name}
                  </p>
                  {role.description && (
                    <p className={`text-xs mt-1 truncate ${
                      currentRoleId === role.id ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {role.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {role.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        currentRoleId === role.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {role.category}
                      </span>
                    )}
                    {role.source === 'shared' && (
                      <span className="text-xs text-blue-400">👥 Partagé</span>
                    )}
                  </div>
                </div>
              </button>

              {canDelete && role.isOwned && (
                <button
                  onClick={() => setShowDeleteConfirm(`role-${role.id}`)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 rounded-lg transition-all ${
                    currentRoleId === role.id
                      ? 'hover:bg-white/20'
                      : 'hover:bg-red-600/90'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {showDeleteConfirm === `role-${role.id}` && (
                <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center gap-2 z-10 shadow-xl border border-gray-700">
                  <p className="text-xs text-center text-gray-200 font-medium">Supprimer ce rôle ?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleDeleteRole(role.id);
                        setShowDeleteConfirm(null);
                      }}
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
      className={`h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col transition-all duration-300 shadow-2xl border-r border-gray-800/50 ${
        isExpanded || isPinned ? 'w-80' : 'w-20'
      }`}
      onMouseEnter={() => !isPinned && setIsExpanded(true)}
      onMouseLeave={() => !isPinned && setIsExpanded(false)}
    >
      {/* Header avec onglets */}
      <div className="p-4 border-b border-gray-800/50">
        {/* Bouton Nouvelle conversation */}
        <button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvelle conversation</span>
        </button>

        {/* Onglets */}
        <div className="flex gap-2 bg-gray-800/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Historique</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'roles'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Rôles</span>
            </div>
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="relative">
          <input
            type="text"
            placeholder={activeTab === 'history' ? 'Rechercher une conversation...' : 'Rechercher un rôle...'}
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

      {/* Contenu selon l'onglet actif */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {activeTab === 'history' ? (
          // ONGLET HISTORIQUE
          filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 mt-16 px-4">
              {searchQuery ? (
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
                  <p className="text-xs mt-2 text-gray-600">Créez-en une nouvelle</p>
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
          )
        ) : (
          // ONGLET RÔLES
          loadingRoles ? (
            <div className="text-center text-gray-500 mt-16 px-4">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Chargement des rôles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center text-gray-500 mt-16 px-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Aucun rôle disponible</p>
              <p className="text-xs mt-2 text-gray-600">Créez votre premier rôle personnalisé</p>
            </div>
          ) : (
            <div className="space-y-6">
              {renderRoleGroup("Rôles système", groupedRoles.system, false)}
              {renderRoleGroup("Mes rôles", groupedRoles.owned, true)}
              {renderRoleGroup("Rôles partagés", groupedRoles.shared, false)}
            </div>
          )
        )}
      </div>

      {/* Footer avec info utilisateur */}
      <div className="p-4 border-t border-gray-800/50 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-green-500/20 flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm">
                {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
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