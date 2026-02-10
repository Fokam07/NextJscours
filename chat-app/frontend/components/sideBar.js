// frontend/components/sideBar.js
'use client';

import { useState, useEffect } from 'react';
import RoleModal from './RoleModal';

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
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false); // État pour le modal

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
          'x-user-id': user?.id,
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

  const handleRoleSaved = (newRole) => {
    loadRoles(); // Recharger la liste après création ou édition
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id,
        },
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
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">
          {title}
        </h3>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative rounded-xl transition-all duration-200 ${
                currentConversationId === conv.id
                  ? 'bg-blue-600/10 border border-blue-500/20'
                  : 'hover:bg-gray-800/40'
              }`}
            >
              <button
                onClick={() => onSelectConversation(conv.id)}
                className="w-full text-left p-3 flex items-start gap-3 pr-10"
              >
                <div className={`flex-shrink-0 mt-0.5 ${
                  currentConversationId === conv.id ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate text-sm leading-5 ${
                    currentConversationId === conv.id ? 'text-blue-50' : 'text-gray-300'
                  }`}>
                    {conv.title}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(conv.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 rounded-lg text-gray-500 hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              {showDeleteConfirm === conv.id && (
                <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center gap-2 z-10 border border-gray-700">
                  <p className="text-[10px] text-center text-gray-400 font-bold uppercase">Supprimer ?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      OUI
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      NON
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
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">
          {title}
        </h3>
        <div className="space-y-1">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`group relative rounded-xl transition-all duration-200 ${
                currentRoleId === role.id
                  ? 'bg-purple-600/10 border border-purple-500/20'
                  : 'hover:bg-gray-800/40'
              }`}
            >
              <button
                onClick={() => onSelectRole(role.id)}
                className="w-full text-left p-3 flex items-center gap-3 pr-10"
              >
                <div className="flex-shrink-0 text-xl">
                  {role.icon || '🤖'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate text-sm leading-5 ${
                    currentRoleId === role.id ? 'text-purple-50' : 'text-gray-300'
                  }`}>
                    {role.name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">
                    {role.category}
                  </p>
                </div>
              </button>

              {canDelete && role.source === 'owned' && (
                <button
                  onClick={() => setShowDeleteConfirm(`role-${role.id}`)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {showDeleteConfirm === `role-${role.id}` && (
                <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center gap-2 z-10 border border-gray-700">
                  <p className="text-[10px] text-center text-gray-400 font-bold uppercase">Supprimer ?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleDeleteRole(role.id);
                        setShowDeleteConfirm(null);
                      }}
                      className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      OUI
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      NON
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
      className={`h-screen bg-[#0D1117] flex flex-col transition-all duration-300 border-r border-gray-800/60 ${
        isExpanded || isPinned ? 'w-72' : 'w-20'
      }`}
      onMouseEnter={() => !isPinned && setIsExpanded(true)}
      onMouseLeave={() => !isPinned && setIsExpanded(false)}
    >
      {/* Header avec bouton Nouveau */}
      <div className="p-4 space-y-4">
        <button
          onClick={onNewConversation}
          className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {(isExpanded || isPinned) && <span className="text-sm font-semibold tracking-wide">Nouveau Chat</span>}
        </button>

        {/* Onglets (Affichés si étendu) */}
        {(isExpanded || isPinned) && (
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'history' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Historique
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'roles' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Rôles
            </button>
          </div>
        )}
      </div>

      {/* Recherche et Bouton Créer Rôle */}
      {(isExpanded || isPinned) && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] text-sm text-gray-300 pl-9 pr-4 py-2.5 rounded-xl border border-white/5 focus:border-blue-500/30 outline-none transition-all placeholder:text-gray-600"
            />
            <svg className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {activeTab === 'roles' && (
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              className="p-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/20 transition-all active:scale-90"
              title="Nouveau Rôle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {activeTab === 'history' ? (
          <div className="space-y-2">
            {renderConversationGroup("Aujourd'hui", groupedConversations.today)}
            {renderConversationGroup("Historique", [...groupedConversations.yesterday, ...groupedConversations.lastWeek, ...groupedConversations.lastMonth, ...groupedConversations.older])}
          </div>
        ) : (
          <div className="space-y-2">
            {loadingRoles ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {renderRoleGroup("Système", groupedRoles.system, false)}
                {renderRoleGroup("Mes Rôles", groupedRoles.owned, true)}
                {renderRoleGroup("Partagés", groupedRoles.shared, false)}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Utilisateur */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/10">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {(isExpanded || isPinned) && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-200 truncate uppercase tracking-tighter">
                  {user?.user_metadata?.username || user?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Pro Plan</p>
                </div>
              </div>
            )}
          </div>
          
          {(isExpanded || isPinned) && (
            <div className="flex gap-1">
              <button
                onClick={togglePin}
                className={`p-2 rounded-lg transition-all ${isPinned ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:bg-white/5'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={onSignOut}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création de rôle */}
      <RoleModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        onSave={handleRoleSaved}
        user={user}
        // roleToEdit pourrait être passé ici si tu ajoutes un bouton "Edit" sur les rôles
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}