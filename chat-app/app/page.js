'use client';

import { useState } from 'react';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useConversations } from '@/frontend/hooks/useConversations';
import LoginForm from '@/frontend/components/loginForm';
import RegisterForm from '@/frontend/components/registerform';
import Sidebar from '@/frontend/components/sideBar';
import ChatArea from '@/frontend/components/chatArea';
import { useNavigate } from '@/frontend/hooks/useNavigate';
import HomePage from '@/frontend/components/home';

export default function Home() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const {pop,push, route} = useNavigate();
  const {
    conversations,
    createConversation,
    deleteConversation,
    refreshConversations,
  } = useConversations(user?.id);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Interface principale
  const handleNewConversation = async () => {
    const newConv = await createConversation();
    if (newConv) {
      setCurrentConversationId(newConv.id);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    await deleteConversation(conversationId);
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    push('home', true);
    setCurrentConversationId(null);
  };

  if(!user){
    switch (route) {
    case 'home':
      return <HomePage></HomePage>;
    case 'login':
      console.log("losh sur login");
      return <LoginForm
        onLogin={signIn}
        onSwitchToRegister={() => push('register')}
      />
    case 'register':
      return <RegisterForm
        onRegister={signUp}
        onSwitchToLogin={() => push('login')}
      />
    }
  }
  console.log("la route actuelle ", route)

  switch (route) {
    case 'chat-area':
      return (
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={setCurrentConversationId}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onSignOut={handleSignOut}
            user={user}
          />
          <ChatArea conversationId={currentConversationId} userId={user?.id} />
        </div>
      );
    default:
      console.log("ca ne sert a rien")
      break;
  }
}