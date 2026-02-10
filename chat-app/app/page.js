"use client";

import { useState } from 'react';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useConversations } from '@/frontend/hooks/useConversations';
import LoginForm from '@/frontend/components/loginForm';
import RegisterForm from '@/frontend/components/registerform';
import Sidebar from '@/frontend/components/sideBar';
import ChatArea from '@/frontend/components/chatArea';
import { useNavigate } from '@/frontend/hooks/useNavigate';
import HomePage from '@/frontend/components/home';
import GeneratorPage from '@/frontend/components/cvGenerator';

export default function Home() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const { push, route } = useNavigate();
  const [currentRoleId, setCurrentRoleId] = useState(null);

  const {
    conversations,
    createConversation,
    deleteConversation,
    refreshConversations,
  } = useConversations(user?.id);

  // ✅ NavigateProvider ya maneja la navegación automática
  // NO duplicar la lógica aquí para evitar loops infinitos

  // Loading state
  if (authLoading && route !== 'login' && route !== 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Créer une nouvelle conversation en passant le rôle actif
  const handleNewConversation = async () => {
    const newConv = await createConversation(currentRoleId); // ← roleId transmis
    if (newConv) {
      handleSelectConverstion(newConv.id);
    }
  };

  // ✅ CORRECTION MAJEURE : Sélectionner un rôle
  // - met à jour l'état local
  // - si une conversation est déjà ouverte, change son rôle via l'API
  const handleSelectRole = async (role) => {
    const roleId = role?.id || null;
    
    console.log('[page] Sélection du rôle:', role?.name || 'Aucun', 'ID:', roleId);
    setCurrentRoleId(roleId);

    // ✅ Si une conversation est active, changer son rôle immédiatement
    if (currentConversationId) {
      try {
        console.log('[page] Changement de rôle pour conversation:', currentConversationId);
        const response = await fetch(`/api/conversations/${currentConversationId}/role`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id,
          },
          body: JSON.stringify({ roleId }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('[page] Erreur API changement de rôle:', error);
          alert(`Erreur: ${error.error || 'Impossible de changer de rôle'}`);
          return;
        }

        const result = await response.json();
        console.log('[page] ✅ Rôle changé avec succès:', result);
        
        // ✅ IMPORTANT : Informer l'utilisateur que le changement est effectif
        // Le prochain message utilisera le nouveau rôle
      } catch (err) {
        console.error('[page] Erreur changement de rôle:', err);
        alert('Erreur lors du changement de rôle');
      }
    }
  };

  const handleSelectConverstion = (conversationId) =>{
    setCurrentConversationId(conversationId);
    push('chat-area');
  }

  const handleDeleteConversation = async (conversationId) => {
    await deleteConversation(conversationId);
    if (currentConversationId === conversationId) setCurrentConversationId(null);
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentConversationId(null);
    setCurrentRoleId(null); // ← reset du rôle à la déconnexion
    push("home", true);
  };

  // ✅ Si pas connecté : routes publiques
  if (!user) {
    switch (route) {
      case "login":
        return (
          <LoginForm
            onLogin={signIn}
            onSwitchToRegister={() => push("register")}
          />
        );
      case "register":
        return (
          <RegisterForm
            onRegister={signUp}
            onSwitchToLogin={() => push("login")}
          />
        );
      case "home":
      default:
        return <HomePage />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConverstion}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onSignOut={handleSignOut}
            user={user}
            onSelectRole={handleSelectRole}  // ← fonction complète qui gère l'objet role
            currentRoleId={currentRoleId}
          />
          {
            route === 'chat-area' ?
              <ChatArea conversationId={currentConversationId} userId={user?.id} currentRoleId = {currentRoleId} />:
            route ==='cv-builder'?
              <GeneratorPage user={user} ></GeneratorPage>:
              <div></div>
          }
    </div>
  );
}
