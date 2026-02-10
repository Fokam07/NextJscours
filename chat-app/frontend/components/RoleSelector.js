// components/RolesSelector.jsx
'use client';

import { useRoles } from '@/hooks/useRoles.js';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth.js';

export default function RolesSelector({ onRoleSelect, currentRoleId }) {
  const { user, loading: authLoading } = useAuth();
  
  // ✅ Un seul appel à useRoles avec user?.id
  const { roles, loading, error, createRole, deleteRole } = useRoles(user?.id);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    description: '',
    icon: '🤖',
    category: 'custom',
    visibility: 'private'
  });

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const newRole = await createRole(formData);
      alert('Rôle créé avec succès !');
      setShowCreateForm(false);
      setFormData({
        name: '',
        system_prompt: '',
        description: '',
        icon: '🤖',
        category: 'custom',
        visibility: 'private'
      });
      if (onRoleSelect) onRoleSelect(newRole);
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Voulez-vous vraiment supprimer ce rôle ?')) return;
    try {
      await deleteRole(roleId);
      alert('Rôle supprimé avec succès !');
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  // Attendre le chargement de l'auth
  if (authLoading) {
    return <div className="p-4">Chargement de l'authentification...</div>;
  }

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        Vous devez être connecté pour voir vos rôles.
      </div>
    );
  }

  // Chargement des rôles
  if (loading) {
    return <div className="p-4">Chargement des rôles...</div>;
  }

  // Erreur
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="font-semibold">Erreur</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Mes Rôles ({roles.length})</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? 'Annuler' : '+ Nouveau rôle'}
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <form onSubmit={handleCreateRole} className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-3">Créer un nouveau rôle</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Nom du rôle *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Ex: Expert en Python"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Icône
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="🤖"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Description courte"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Prompt système *
            </label>
            <textarea
              required
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={4}
              placeholder="Tu es un expert en programmation Python..."
              minLength={10}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="custom">Personnalisé</option>
              <option value="work">Travail</option>
              <option value="creative">Créatif</option>
              <option value="learning">Apprentissage</option>
              <option value="coding">Programmation</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Visibilité
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="private">Privé (seulement moi)</option>
              <option value="shared">Partagé</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Créer le rôle
          </button>
        </form>
      )}

      {/* Liste des rôles */}
      <div className="space-y-2">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`p-3 border rounded cursor-pointer hover:bg-gray-50 transition ${
              currentRoleId === role.id ? 'bg-blue-50 border-blue-500' : ''
            }`}
            onClick={() => onRoleSelect && onRoleSelect(role)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <h3 className="font-semibold">{role.name}</h3>
                    {role.description && (
                      <p className="text-sm text-gray-600">{role.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {role.source === 'owned' ? '👤 Mon rôle' : 
                     role.source === 'shared' ? '🤝 Partagé' : 
                     '🌐 Système'}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {role.category}
                  </span>
                  {role.usage_count > 0 && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      📊 {role.usage_count} utilisations
                    </span>
                  )}
                </div>
              </div>

              {role.isOwned && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRole(role.id);
                  }}
                  className="ml-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}

        {roles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun rôle disponible. Créez-en un !
          </div>
        )}
      </div>
    </div>
  );
}