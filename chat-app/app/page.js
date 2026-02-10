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

  const {
    conversations,
    createConversation,
    deleteConversation,
    refreshConversations,
  } = useConversations(user?.id);

  // ✅ NavigateProvider ya maneja la navegación automática
  // NO duplicar la lógica aquí para evitar loops infinitos

  // Loading state
  if (authLoading && route!=='login' && route!=='register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleNewConversation = async () => {
    const newConv = await createConversation();
    if (newConv) {
      handleSelectConverstion(newConv.id);
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
          />
          {
            route === 'chat-area' ?
              <ChatArea conversationId={currentConversationId} userId={user?.id} />:
            route ==='cv-builder'?
              <GeneratorPage user={user} ></GeneratorPage>:
              <div></div>
          }
    </div>
  );
}
