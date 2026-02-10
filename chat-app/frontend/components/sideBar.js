// frontend/components/sideBar.js - Thème Overlord
'use client';

import { useState, useEffect, useCallback } from 'react';
import RoleModal from './RoleModal';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSignOut,
  user,
  onSelectRole,
  currentRoleId,
  onShowCVGenerator,
  isShowingCV = false,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  
  const [activeTab, setActiveTab] = useState('history');
  
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    if (isShowingCV) {
      setActiveTab('cv');
    } else if (activeTab === 'cv') {
      setActiveTab('history');
    }
  }, [isShowingCV]);

  const loadRoles = useCallback(async () => {
    if (!user?.id) return;

    setLoadingRoles(true);
    try {
      const response = await fetch('/api/roles', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      } else {
        console.error('Erreur API roles:', response.status);
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
    } finally {
      setLoadingRoles(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'roles' && user?.id) {
      loadRoles();
    }
  }, [activeTab, user?.id, loadRoles]);

  const handleRoleSaved = useCallback((savedRole) => {
    if (savedRole) {
      setRoles(prev => {
        const exists = prev.find(r => r.id === savedRole.id);
        if (exists) {
          return prev.map(r => r.id === savedRole.id ? { ...savedRole, source: 'owned' } : r);
        } else {
          return [...prev, { ...savedRole, source: 'owned' }];
        }
      });
    }
    loadRoles();
  }, [loadRoles]);

  const handleDeleteRole = async (roleId) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id,
        },
      });
      
      if (response.ok) {
        setRoles(prev => prev.filter(r => r.id !== roleId));
        if (currentRoleId === roleId) {
          onSelectRole(null);
        }
      } else {
        console.error('Erreur suppression rôle:', response.status);
        loadRoles();
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

  const handleCVTabClick = () => {
    setActiveTab('cv');
    if (onShowCVGenerator) {
      onShowCVGenerator();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupConversationsByDate = (conversations) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const groups = { today: [], yesterday: [], lastWeek: [], lastMonth: [], older: [] };

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

  const groupRolesBySource = (roles) => {
    const groups = { system: [], owned: [], shared: [] };

    roles.forEach(role => {
      if (role.source === 'system') {
        groups.system.push(role);
      } else if (role.source === 'owned') {
        groups.owned.push(role);
      } else if (role.source === 'shared') {
        groups.shared.push(role);
      } else {
        groups.owned.push(role);
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
        <h3 className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em] px-3 mb-3 flex items-center gap-2">
          <div className="w-4 h-[1px] bg-[hsl(42,50%,54%,0.3)]"></div>
          {title}
          <div className="flex-1 h-[1px] bg-[hsl(42,50%,54%,0.3)]"></div>
        </h3>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative rounded-lg transition-all duration-200 ${
                currentConversationId === conv.id
                  ? 'bg-[hsl(0,60%,35%,0.15)] border border-[hsl(0,60%,35%,0.25)]'
                  : 'hover:bg-[hsl(260,20%,10%)] border border-transparent'
              }`}
            >
              <button
                onClick={() => onSelectConversation(conv.id)}
                className="w-full text-left px-3 py-3 flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full ${
                  currentConversationId === conv.id 
                    ? 'bg-[hsl(42,50%,54%)]' 
                    : 'bg-[hsl(260,15%,14%)] group-hover:bg-[hsl(42,50%,54%,0.5)]'
                } transition-colors`}></div>
                <span className={`text-sm truncate flex-1 ${
                  currentConversationId === conv.id
                    ? 'text-[hsl(42,30%,82%)] font-bold'
                    : 'text-[hsl(42,30%,65%)] group-hover:text-[hsl(42,30%,82%)]'
                } transition-colors`}>
                  {conv.title}
                </span>
              </button>

              {showDeleteConfirm === conv.id && (
                <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[hsl(260,20%,10%)] rounded-lg border border-[hsl(260,15%,14%)] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <p className="text-[10px] text-center text-[hsl(42,30%,82%)] font-bold uppercase mb-2">Supprimer la conversation ?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className="flex-1 bg-[hsl(0,60%,35%,0.2)] text-[hsl(0,50%,60%)] hover:bg-[hsl(0,60%,35%,0.4)] py-1.5 rounded-lg text-xs font-bold transition-colors border border-[hsl(0,60%,35%,0.3)]"
                    >
                      OUI
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 bg-[hsl(260,15%,14%)] text-[hsl(42,30%,65%)] hover:bg-[hsl(260,10%,18%)] py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      NON
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(showDeleteConfirm === conv.id ? null : conv.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[hsl(0,60%,35%,0.1)] hover:bg-[hsl(0,60%,35%,0.2)] text-[hsl(0,50%,60%)] opacity-0 group-hover:opacity-100 transition-all border border-[hsl(0,60%,35%,0.2)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRoleGroup = (title, roles, canDelete) => {
    if (roles.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em] px-3 mb-3 flex items-center gap-2">
          <div className="w-4 h-[1px] bg-[hsl(42,50%,54%,0.3)]"></div>
          {title}
          <div className="flex-1 h-[1px] bg-[hsl(42,50%,54%,0.3)]"></div>
        </h3>
        <div className="space-y-1">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`group relative rounded-lg transition-all duration-200 ${
                currentRoleId === role.id
                  ? 'bg-[hsl(270,50%,40%,0.15)] border border-[hsl(270,50%,40%,0.25)]'
                  : 'hover:bg-[hsl(260,20%,10%)] border border-transparent'
              }`}
            >
              <button
                onClick={() => onSelectRole(role)}
                className="w-full text-left px-3 py-3 flex items-center gap-3"
              >
                <span className="text-xl flex-shrink-0">{role.icon || '🎭'}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold truncate ${
                    currentRoleId === role.id
                      ? 'text-[hsl(42,30%,82%)]'
                      : 'text-[hsl(42,30%,65%)] group-hover:text-[hsl(42,30%,82%)]'
                  } transition-colors`}>
                    {role.name}
                  </div>
                  {role.description && (
                    <div className="text-[10px] text-[hsl(42,30%,45%)] truncate uppercase tracking-wide">
                      {role.description}
                    </div>
                  )}
                </div>
                {role.usage_count > 0 && (
                  <span className="text-[10px] px-2 py-1 bg-[hsl(42,50%,54%,0.1)] text-[hsl(42,50%,54%)] rounded font-bold border border-[hsl(42,50%,54%,0.2)]">
                    {role.usage_count}
                  </span>
                )}
              </button>

              {canDelete && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(showDeleteConfirm === role.id ? null : role.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[hsl(0,60%,35%,0.1)] hover:bg-[hsl(0,60%,35%,0.2)] text-[hsl(0,50%,60%)] opacity-0 group-hover:opacity-100 transition-all border border-[hsl(0,60%,35%,0.2)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {showDeleteConfirm === role.id && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[hsl(260,20%,10%)] rounded-lg border border-[hsl(260,15%,14%)] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <p className="text-[10px] text-center text-[hsl(42,30%,82%)] font-bold uppercase mb-2">Supprimer le rôle ?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleDeleteRole(role.id);
                            setShowDeleteConfirm(null);
                          }}
                          className="flex-1 bg-[hsl(0,60%,35%,0.2)] text-[hsl(0,50%,60%)] hover:bg-[hsl(0,60%,35%,0.4)] py-1.5 rounded-lg text-xs font-bold transition-colors border border-[hsl(0,60%,35%,0.3)]"
                        >
                          OUI
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 bg-[hsl(260,15%,14%)] text-[hsl(42,30%,65%)] hover:bg-[hsl(260,10%,18%)] py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          NON
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`h-screen bg-gradient-to-b from-[hsl(260,25%,7%)] to-[hsl(260,20%,10%)] flex flex-col transition-all duration-300 border-r border-[hsl(260,15%,14%)] shadow-[4px_0_20px_rgba(0,0,0,0.3)] ${
        isExpanded || isPinned ? 'w-72' : 'w-20'
      }`}
      onMouseEnter={() => !isPinned && setIsExpanded(true)}
      onMouseLeave={() => !isPinned && setIsExpanded(false)}
    >
      {/* Header avec ornement */}
      <div className="p-4 space-y-4 border-b border-[hsl(260,15%,14%)]">
        {/* Logo/Titre */}
        {(isExpanded || isPinned) && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(0,60%,35%)] to-[hsl(0,60%,40%)] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-[hsl(0,50%,40%,0.3)]">
              <svg className="w-6 h-6 text-[hsl(42,50%,70%)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-[hsl(42,50%,54%)] tracking-wider uppercase">Nazarick</h1>
              <p className="text-[9px] text-[hsl(42,30%,45%)] uppercase tracking-[0.2em]">Grand Tombeau</p>
            </div>
          </div>
        )}

        <button
          onClick={()=>{push('cv-builder')}}
          className={`w-full mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] ${
            !isExpanded && !isPinned ? 'px-0' : 'px-4'
          }`}
          title={!isExpanded && !isPinned ? 'generer un cv' : ''}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {(isExpanded || isPinned) && <span>Generer un CV</span>}
        </button>

        <button
          onClick={onNewConversation}
          className="w-full h-11 bg-gradient-to-r from-[hsl(0,60%,30%)] to-[hsl(0,60%,35%)] hover:from-[hsl(0,60%,35%)] hover:to-[hsl(0,60%,40%)] text-[hsl(42,50%,70%)] border border-[hsl(0,50%,40%,0.3)] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(139,0,0,0.2)] font-bold uppercase tracking-wide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {(isExpanded || isPinned) && <span className="text-sm">Nouvelle Audience</span>}
        </button>

        {(isExpanded || isPinned) && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-[hsl(260,20%,8%)] rounded-xl border border-[hsl(260,15%,14%)]">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg transition-all ${
                activeTab === 'history' 
                  ? 'bg-[hsl(0,60%,35%,0.2)] text-[hsl(42,50%,54%)] border border-[hsl(0,60%,35%,0.3)]' 
                  : 'text-[hsl(42,30%,45%)] hover:text-[hsl(42,30%,65%)]'
              }`}
            >
              Archive
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg transition-all ${
                activeTab === 'roles' 
                  ? 'bg-[hsl(270,50%,40%,0.2)] text-[hsl(42,50%,54%)] border border-[hsl(270,50%,40%,0.3)]' 
                  : 'text-[hsl(42,30%,45%)] hover:text-[hsl(42,30%,65%)]'
              }`}
            >
              Rôles
            </button>
            <button
              onClick={handleCVTabClick}
              className={`py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg transition-all ${
                activeTab === 'cv' 
                  ? 'bg-[hsl(142,70%,36%,0.2)] text-[hsl(42,50%,54%)] border border-[hsl(142,70%,36%,0.3)]' 
                  : 'text-[hsl(42,30%,45%)] hover:text-[hsl(42,30%,65%)]'
              }`}
            >
              Forge
            </button>
          </div>
        )}
      </div>

      {/* Recherche et Bouton Créer Rôle */}
      {(isExpanded || isPinned) && activeTab !== 'cv' && (
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[hsl(260,20%,8%)] text-sm text-[hsl(42,30%,82%)] pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(260,15%,14%)] focus:border-[hsl(42,50%,54%,0.3)] outline-none transition-all placeholder:text-[hsl(260,10%,25%)]"
            />
            <svg className="w-4 h-4 text-[hsl(260,10%,25%)] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {activeTab === 'roles' && (
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              className="p-2.5 bg-[hsl(270,50%,40%,0.15)] hover:bg-[hsl(270,50%,40%,0.25)] text-[hsl(270,50%,50%)] rounded-xl border border-[hsl(270,50%,40%,0.2)] transition-all active:scale-90 shadow-[0_0_10px_rgba(138,43,226,0.1)]"
              title="Nouveau Rôle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
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
            {renderConversationGroup("Archives", [
              ...groupedConversations.yesterday,
              ...groupedConversations.lastWeek,
              ...groupedConversations.lastMonth,
              ...groupedConversations.older
            ])}
            
            {filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(260,20%,10%)] rounded-xl flex items-center justify-center border border-[hsl(260,15%,14%)]">
                  <svg className="w-8 h-8 text-[hsl(42,30%,45%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-[hsl(42,30%,45%)] font-medium">Aucune conversation</p>
                <p className="text-xs text-[hsl(260,10%,25%)] mt-1">Commencez une nouvelle audience</p>
              </div>
            )}
          </div>
        ) : activeTab === 'roles' ? (
          <div className="space-y-2">
            {loadingRoles ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[hsl(270,50%,40%,0.2)] border-t-[hsl(270,50%,40%)] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {roles.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(260,20%,10%)] rounded-xl flex items-center justify-center border border-[hsl(260,15%,14%)]">
                      <svg className="w-8 h-8 text-[hsl(42,30%,45%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[hsl(42,30%,45%)] font-medium mb-2">Aucun rôle</p>
                    <p className="text-xs text-[hsl(260,10%,25%)]">Créez votre premier rôle</p>
                  </div>
                )}
                {renderRoleGroup("Système", groupedRoles.system, false)}
                {renderRoleGroup("Mes Rôles", groupedRoles.owned, true)}
                {renderRoleGroup("Partagés", groupedRoles.shared, false)}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(142,70%,36%,0.15)] rounded-xl flex items-center justify-center border border-[hsl(142,70%,36%,0.25)]">
              <svg className="w-8 h-8 text-[hsl(142,70%,45%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-[hsl(42,50%,54%)] uppercase tracking-wide mb-1">Forge de Parchemins</p>
            <p className="text-xs text-[hsl(42,30%,45%)]">Mode création activé</p>
          </div>
        )}
      </div>

      {/* Footer Utilisateur */}
      <div className="p-4 border-t border-[hsl(260,15%,14%)] bg-[hsl(260,25%,7%)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[hsl(42,50%,54%)] to-[hsl(42,45%,60%)] rounded-xl flex items-center justify-center text-[hsl(260,25%,7%)] text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {(isExpanded || isPinned) && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[hsl(42,30%,82%)] truncate uppercase tracking-tight">
                  {user?.user_metadata?.username || user?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[hsl(142,70%,45%)] rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]"></div>
                  <p className="text-[9px] text-[hsl(42,30%,45%)] font-bold uppercase tracking-wider">Sorcier Suprême</p>
                </div>
              </div>
            )}
          </div>
          
          {(isExpanded || isPinned) && (
            <div className="flex gap-1">
              <button
                onClick={togglePin}
                className={`p-2 rounded-lg transition-all ${
                  isPinned 
                    ? 'text-[hsl(42,50%,54%)] bg-[hsl(42,50%,54%,0.1)] border border-[hsl(42,50%,54%,0.2)]' 
                    : 'text-[hsl(42,30%,45%)] hover:bg-[hsl(260,20%,10%)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={onSignOut}
                className="p-2 text-[hsl(0,50%,60%)] hover:text-[hsl(0,50%,70%)] hover:bg-[hsl(0,60%,35%,0.1)] rounded-lg transition-all border border-transparent hover:border-[hsl(0,60%,35%,0.2)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/édition de rôle */}
      <RoleModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        onSave={handleRoleSaved}
        user={user}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { 
          width: 4px; 
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