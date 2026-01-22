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

  const handleDelete = (conversationId) => {
    onDeleteConversation(conversationId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle conversation
        </button>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 px-4">
            <p className="text-sm">Aucune conversation</p>
            <p className="text-xs mt-2">Cliquez ci-dessus pour commencer</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative rounded-lg transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800'
                }`}
              >
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className="w-full text-left p-3 pr-12"
                >
                  <p className="font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </button>

                {/* Bouton supprimer */}
                <button
                  onClick={() => setShowDeleteConfirm(conv.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-600 rounded transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Confirmation suppression */}
                {showDeleteConfirm === conv.id && (
                  <div className="absolute inset-0 bg-gray-900 rounded-lg p-2 flex flex-col justify-center gap-2">
                    <p className="text-xs text-center">Supprimer ?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(conv.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 py-1 px-2 rounded text-xs"
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded text-xs"
                      >
                        Non
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer avec info utilisateur */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">
                {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Déconnexion"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}