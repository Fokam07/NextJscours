'use client';

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
  const [showRegister, setShowRegister] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const { pop, push, route } = useNavigate();
  const [showCVGenerator, setShowCVGenerator] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  // ✅ CORRECTION 1 : Hook appelé uniquement si user existe
  const {
    conversations,
    createConversation,
    deleteConversation,
    refreshConversations,
    loading: conversationsLoading,
  } = useConversations(user?.id);

  // ✅ CORRECTION 2 : Redirection automatique vers chat-area si connecté
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[page] Utilisateur connecté, redirection vers chat-area');
      if (route !== 'chat-area') {
        push('chat-area', true);
      }
    }
  }, [user, authLoading]);

  // ✅ CORRECTION 3 : Charger les conversations au montage et à chaque fois que user change
  useEffect(() => {
    if (user?.id && refreshConversations) {
      console.log('[page] 🔄 Chargement des conversations pour user:', user.id);
      refreshConversations();
    }
  }, [user?.id]);

  // ✅ CORRECTION 4 : Logger l'état des conversations pour debug
  useEffect(() => {
    if (conversations) {
      console.log('[page] 📋 Conversations chargées:', conversations.length);
      console.log('[page] Conversations:', conversations);
    }
  }, [conversations]);

  // Loading state amélioré
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Créer une nouvelle conversation en passant le rôle actif
  const handleNewConversation = async () => {
    console.log('[page] 🆕 Création nouvelle conversation avec roleId:', currentRoleId);
    
    try {
      const newConv = await createConversation(currentRoleId);
      
      if (newConv) {
        console.log('[page] ✅ Conversation créée:', newConv.id);
        setCurrentConversationId(newConv.id);
        
        // ✅ CORRECTION 5 : Rafraîchir la liste après création
        if (refreshConversations) {
          console.log('[page] 🔄 Rafraîchissement de la liste...');
          await refreshConversations();
        }
      } else {
        console.error('[page] ❌ Échec création conversation - newConv est null/undefined');
      }
    } catch (error) {
      console.error('[page] ❌ Erreur lors de la création:', error);
      alert('Erreur lors de la création de la conversation');
    }
  };

  // Sélectionner un rôle et mettre à jour la conversation active
  const handleSelectRole = async (role) => {
    const roleId = role?.id || null;
    
    console.log('[page] 🎭 Sélection du rôle:', role?.name || 'Aucun', 'ID:', roleId);
    setCurrentRoleId(roleId);

    // Si une conversation est active, changer son rôle immédiatement
    if (currentConversationId && user?.id) {
      try {
        console.log('[page] 🔄 Changement de rôle pour conversation:', currentConversationId);
        
        const response = await fetch(`/api/conversations/${currentConversationId}/role`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({ roleId }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('[page] ❌ Erreur API changement de rôle:', error);
          alert(`Erreur: ${error.error || 'Impossible de changer de rôle'}`);
          return;
        }

        const result = await response.json();
        console.log('[page] ✅ Rôle changé avec succès:', result);
      } catch (err) {
        console.error('[page] ❌ Erreur changement de rôle:', err);
        alert('Erreur lors du changement de rôle');
      }
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    console.log('[page] 🗑️ Suppression conversation:', conversationId);
    
    try {
      await deleteConversation(conversationId);
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }
      
      // ✅ CORRECTION 6 : Rafraîchir la liste après suppression
      if (refreshConversations) {
        console.log('[page] 🔄 Rafraîchissement après suppression...');
        await refreshConversations();
      }
      
      console.log('[page] ✅ Conversation supprimée');
    } catch (error) {
      console.error('[page] ❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la conversation');
    }
  };

  const handleSignOut = async () => {
    console.log('[page] 👋 Déconnexion...');
    await signOut();
    push('home', true);
    setCurrentConversationId(null);
    setCurrentRoleId(null);
  };

  // ✅ CORRECTION 7 : Si pas d'utilisateur, gérer les routes publiques
  if (!user) {
    switch (route) {
      case 'home':
        return <HomePage />;
      case 'login':
        return (
          <LoginForm
            onLogin={async (email, password) => {
              await signIn(email, password);
              // ✅ La redirection sera gérée par le useEffect
            }}
            onSwitchToRegister={() => push('register')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onRegister={async (email, password, name) => {
              await signUp(email, password, name);
              // ✅ La redirection sera gérée par le useEffect
            }}
            onSwitchToLogin={() => push('login')}
          />
        );
      default:
        // ✅ CORRECTION 8 : Route par défaut si pas connecté
        return <HomePage />;
    }
  }

  // ✅ CORRECTION 9 : Si utilisateur connecté, afficher chat-area
  // Supprimer le switch et toujours afficher l'interface
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations || []} // ✅ Toujours passer un tableau
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onSignOut={handleSignOut}
        user={user}
        onSelectRole={handleSelectRole}
        currentRoleId={currentRoleId}
        onShowCVGenerator={() => setShowCVGenerator(true)}
      />
      {showCVGenerator ? (
        <CVGenerator 
          user={user} 
          onGenerate={(data) => {
            setGeneratedData(data);
            setShowCVGenerator(false);
          }} 
        />
      ) : generatedData ? (
        <CVViewer 
          data={generatedData} 
          onClose={() => setGeneratedData(null)} 
        />
      ) : (
        <ChatArea
          conversationId={currentConversationId}
          userId={user?.id}
          currentRoleId={currentRoleId}
        />
      )}
      
      {/* ✅ CORRECTION 10 : Indicateur de chargement des conversations */}
      {conversationsLoading && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Chargement des conversations...</span>
        </div>
      )}
    </div>
  );
}