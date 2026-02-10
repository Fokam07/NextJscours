// frontend/components/RoleSelector.js
'use client';

import { useState, useEffect, useRef } from 'react';

export default function RoleSelector({ selectedRoleId, onRoleChange, conversationId }) {
  const [roles, setRoles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadRoles();
  }, []);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (roleId) => {
    setIsOpen(false);
    
    if (onRoleChange) {
      await onRoleChange(roleId);
    }

    // Si on a un conversationId, mettre à jour le rôle de la conversation
    if (conversationId && roleId !== selectedRoleId) {
      try {
        await fetch(`/api/conversations/${conversationId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId }),
        });
      } catch (error) {
        console.error('Erreur mise à jour rôle conversation:', error);
      }
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Grouper par catégorie
  const groupedRoles = roles.reduce((acc, role) => {
    const source = role.source || 'custom';
    if (!acc[source]) acc[source] = [];
    acc[source].push(role);
    return acc;
  }, {});

  const sourceLabelMap = {
    system: 'Rôles système',
    owned: 'Mes rôles',
    shared: 'Rôles partagés',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de sélection */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border-2 ${
          selectedRoleId
            ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/20'
            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
        }`}
        title={selectedRole ? `Rôle: ${selectedRole.name}` : 'Sélectionner un rôle'}
      >
        <span className="text-xl">
          {selectedRole ? selectedRole.icon : '🤖'}
        </span>
        <span className="text-sm font-medium hidden sm:inline">
          {selectedRole ? selectedRole.name : 'Aucun rôle'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {/* Option "Aucun rôle" */}
          <button
            onClick={() => handleSelectRole(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 ${
              !selectedRoleId ? 'bg-gray-800/50' : ''
            }`}
          >
            <span className="text-2xl">❌</span>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm text-white">Aucun rôle</p>
              <p className="text-xs text-gray-400">Comportement par défaut</p>
            </div>
            {!selectedRoleId && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-400 mt-2">Chargement...</p>
            </div>
          ) : (
            <>
              {Object.entries(groupedRoles).map(([source, sourceRoles]) => (
                <div key={source}>
                  <div className="px-4 py-2 bg-gray-800/50">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {sourceLabelMap[source] || source}
                    </h4>
                  </div>
                  {sourceRoles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                        selectedRoleId === role.id ? 'bg-purple-600/20' : ''
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{role.icon || '🤖'}</span>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-sm text-white truncate">{role.name}</p>
                        {role.description && (
                          <p className="text-xs text-gray-400 truncate">{role.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {role.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                              {role.category}
                            </span>
                          )}
                          {role.source === 'shared' && (
                            <span className="text-xs text-blue-400">👥</span>
                          )}
                        </div>
                      </div>
                      {selectedRoleId === role.id && (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              ))}

              {roles.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-400">Aucun rôle disponible</p>
                  <p className="text-xs text-gray-500 mt-1">Créez-en un dans la sidebar</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}