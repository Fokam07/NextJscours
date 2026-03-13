"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useConversations } from '@/frontend/hooks/useConversations';
import LoginForm from '@/frontend/components/loginForm';
import RegisterForm from '@/frontend/components/registerform';
import Sidebar from '@/frontend/components/sideBar';
import ChatArea from '@/frontend/components/chatArea';
import { useNavigate } from '@/frontend/hooks/useNavigate';
import HomePage from '@/frontend/components/home';
import CVGenerator from '@/frontend/components/cvGenerator';
import CVViewer from '@/frontend/components/cvViewer';

export default function Home() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const { pop, push, route } = useNavigate();

  // ── CV state ──────────────────────────────────────────────────────────────
  // null          → affiche ChatArea
  // 'generator'   → affiche CVGenerator
  // { cv, letter, variants[] } → affiche CVViewer
  const [cvState, setCvState] = useState(null);

  const {
    conversations,
    createConversation,
    deleteConversation,
    refreshConversations,
    loading: conversationsLoading,
  } = useConversations(user?.id);

  // Redirection automatique vers chat-area si connecté
  useEffect(() => {
    if (!authLoading && user) {
      if (route !== 'chat-area') {
        push('chat-area', true);
      }
    }
  }, [user, authLoading]);

  // Charger les conversations au montage
  useEffect(() => {
    if (user?.id && refreshConversations) {
      refreshConversations();
    }
  }, [user?.id]);

  // Loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(260,25%,7%)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[hsl(42,50%,54%)] mx-auto mb-4"></div>
          <p className="text-[hsl(42,30%,65%)] uppercase tracking-widest text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNewConversation = async () => {
    try {
      const newConv = await createConversation(currentRoleId);
      if (newConv) {
        setCurrentConversationId(newConv.id);
        // FIX bug 2: quitter le mode CV si on crée une conversation
        setCvState(null);
        if (refreshConversations) await refreshConversations();
      }
    } catch (error) {
      console.error('[page] Erreur création conversation:', error);
    }
  };

  const handleSelectRole = async (role) => {
    const roleId = role?.id || null;
    setCurrentRoleId(roleId);

    if (currentConversationId && user?.id) {
      try {
        const response = await fetch(`/api/conversations/${currentConversationId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify({ roleId }),
        });
        if (!response.ok) {
          const error = await response.json();
          console.error('[page] Erreur changement de rôle:', error);
        }
      } catch (err) {
        console.error('[page] Erreur changement de rôle:', err);
      }
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);

      // FIX bug 1: reset proprement si c'était la conv active
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }

      if (refreshConversations) await refreshConversations();
    } catch (error) {
      console.error('[page] Erreur suppression conversation:', error);
    }
  };

  const handleSelectConversation = (convId) => {
    setCurrentConversationId(convId);
    // FIX bug 2: retour au chat quand on sélectionne une conversation
    setCvState(null);
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentConversationId(null);
    setCurrentRoleId(null);
    setCvState(null);
  };

  // ── Routing non connecté ──────────────────────────────────────────────────
  if (!user) {
    switch (route) {
      case 'home':
        return <HomePage />;
      case 'login':
        return (
          <LoginForm
            onLogin={async (email, password) => { await signIn(email, password); }}
            onSwitchToRegister={() => push('register')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onRegister={async (email, password, name) => { await signUp(email, password, name); }}
            onSwitchToLogin={() => push('login')}
          />
        );
      default:
        return <HomePage />;
    }
  }

  // ── Determine main panel ──────────────────────────────────────────────────
  // FIX bug 3: aligner les props avec ce que CVGenerator expose réellement
  const renderMainPanel = () => {
    if (cvState === 'generator') {
      return (
        <CVGenerator
          user={user}
          // onViewResult(variantsArray, initialIndex) — prop réelle du composant
          onViewResult={(variants, initialIdx = 0) => {
            setCvState({ variants, initialIdx });
          }}
        />
      );
    }

    if (cvState && typeof cvState === 'object' && cvState.variants) {
      return (
        <CVViewer
          // CVViewer accepte data en tableau ou objet unique
          data={cvState.variants}
          initialVariantIdx={cvState.initialIdx || 0}
          onBack={() => setCvState('generator')}
        />
      );
    }

    // Défaut: ChatArea
    return (
      <ChatArea
        conversationId={currentConversationId}
        userId={user?.id}
        currentRoleId={currentRoleId}
      />
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations || []}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onSignOut={handleSignOut}
        user={user}
        onSelectRole={handleSelectRole}
        currentRoleId={currentRoleId}
        onShowCVGenerator={() => setShowCVGenerator(true)}
        onHideCVGenerator={() => { setShowCVGenerator(false); setGeneratedData(null); }}
        isShowingCV={showCVGenerator || !!generatedData}
      />

      {/* Panneau principal */}
      <div className="flex-1 overflow-hidden">
        {renderMainPanel()}
      </div>

      {/* Indicateur de chargement des conversations */}
      {conversationsLoading && (
        <div className="fixed bottom-4 right-4 bg-[hsl(260,20%,10%)] border border-[hsl(260,15%,18%)] shadow-lg rounded-xl p-3 flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[hsl(42,50%,54%,0.2)] border-t-[hsl(42,50%,54%)]"></div>
          <span className="text-xs text-[hsl(42,30%,55%)] uppercase tracking-widest font-bold">Chargement…</span>
        </div>
      )}
    </div>
  );
}
