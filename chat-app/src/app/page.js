'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useConversations } from '@/frontend/hooks/useConversations';
import LoginForm from '@/frontend/components/loginForm';
import RegisterForm from '@/frontend/components/registerform';
import Sidebar from '@/frontend/components/sideBar';
import ChatArea from '@/frontend/components/chatArea';

export default function Home() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Utiliser userId=53 en attendant que l'auth soit activée
  const userId = user?.id || "53";  // String, pas number!

  const {
    conversations,
    loading: conversationsLoading,
    createConversation,
    deleteConversation,
    refreshConversations,
  } = useConversations(userId);

  // Créer automatiquement une conversation par défaut si aucune n'existe
  useEffect(() => {
    const initializeConversation = async () => {
      // Attendre que les conversations soient chargées
      if (!conversationsLoading && conversations.length === 0) {
        console.log('Aucune conversation trouvée, création d\'une nouvelle...');
        const newConv = await createConversation('Première conversation');
        if (newConv) {
          setCurrentConversationId(newConv.id);
          console.log('Conversation par défaut créée:', newConv.id);
        }
      } else if (conversations.length > 0 && !currentConversationId) {
        // Si des conversations existent mais aucune n'est sélectionnée, sélectionner la première
        console.log('Sélection de la première conversation:', conversations[0].id);
        setCurrentConversationId(conversations[0].id);
      }
    };

    initializeConversation();
  }, [conversationsLoading, conversations.length, currentConversationId, createConversation]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Formulaires de connexion/inscription (commenté pour l'instant)
  // if (!user) {
  //   return showRegister ? (
  //     <RegisterForm
  //       onRegister={signUp}
  //       onSwitchToLogin={() => setShowRegister(false)}
  //     />
  //   ) : (
  //     <LoginForm
  //       onLogin={signIn}
  //       onSwitchToRegister={() => setShowRegister(true)}
  //     />
  //   );
  // }

  // Interface principale
  const handleNewConversation = async () => {
    console.log('🆕 Tentative de création d\'une nouvelle conversation...');
    const newConv = await createConversation('Nouvelle conversation');
    if (newConv) {
      console.log('✅ Nouvelle conversation créée:', newConv);
      setCurrentConversationId(newConv.id);
    } else {
      console.error('❌ Échec de la création de conversation');
      alert('Impossible de créer une nouvelle conversation. Vérifiez la console.');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    console.log('🗑️ Suppression de la conversation:', conversationId);
    await deleteConversation(conversationId);
    
    if (currentConversationId === conversationId) {
      // Si on supprime la conversation active
      const remainingConvs = conversations.filter(c => c.id !== conversationId);
      
      if (remainingConvs.length > 0) {
        // Sélectionner la première conversation restante
        setCurrentConversationId(remainingConvs[0].id);
      } else {
        // Si c'était la dernière, créer une nouvelle
        console.log('Dernière conversation supprimée, création d\'une nouvelle...');
        const newConv = await createConversation('Nouvelle conversation');
        setCurrentConversationId(newConv?.id || null);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentConversationId(null);
  };

  // Afficher un loader si les conversations sont en cours de chargement initial
  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onSignOut={handleSignOut}
        user={user || { id: userId, name: 'Utilisateur' }}
      />
      <ChatArea conversationId={currentConversationId} userId={userId} />
    </div>
  );
}