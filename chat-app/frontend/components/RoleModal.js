// frontend/components/RoleModal.js - Thème Overlord
'use client';

import { useState, useEffect } from 'react';

export default function RoleModal({ isOpen, onClose, onSave, roleToEdit, user }) {
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    description: '',
    icon: '🎭',
    category: 'custom',
    visibility: 'private'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Icons suggestions
  const iconSuggestions = ['🎭', '🧙', '👑', '⚔️', '🏰', '📜', '🔮', '💀', '👹', '🐉', '⚡', '🌟'];

  useEffect(() => {
    if (roleToEdit) {
      setFormData({
        name: roleToEdit.name || '',
        system_prompt: roleToEdit.system_prompt || '',
        description: roleToEdit.description || '',
        icon: roleToEdit.icon || '🎭',
        category: roleToEdit.category || 'custom',
        visibility: roleToEdit.visibility || 'private'
      });
    } else {
      setFormData({
        name: '',
        system_prompt: '',
        description: '',
        icon: '🎭',
        category: 'custom',
        visibility: 'private'
      });
    }
    setError('');
  }, [roleToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const method = roleToEdit ? 'PUT' : 'POST';
      const url = roleToEdit ? `/api/roles/${roleToEdit.id}` : '/api/roles';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      const data = await response.json();
      onSave(data.role);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[hsl(260,25%,7%)] to-[hsl(260,20%,10%)] rounded-2xl border border-[hsl(260,15%,14%)] shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[hsl(260,15%,14%)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(270,50%,40%,0.15)] rounded-xl flex items-center justify-center border border-[hsl(270,50%,40%,0.25)]">
              <svg className="w-6 h-6 text-[hsl(270,50%,50%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[hsl(42,50%,54%)] tracking-wide uppercase">
                {roleToEdit ? 'Modifier le Rôle' : 'Créer un Rôle'}
              </h2>
              <p className="text-xs text-[hsl(42,30%,45%)] uppercase tracking-wider">
                Configurez votre persona IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[hsl(42,30%,65%)] hover:text-[hsl(0,50%,60%)] hover:bg-[hsl(0,60%,35%,0.1)] rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          {/* Error message */}
          {error && (
            <div className="bg-[hsl(0,60%,35%,0.15)] border border-[hsl(0,60%,35%,0.3)] rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-[hsl(0,50%,60%)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-[hsl(0,50%,60%)] uppercase tracking-wide">Erreur</p>
                <p className="text-sm text-[hsl(42,30%,65%)] mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Icon Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">
              Icône
            </label>
            <div className="flex flex-wrap gap-2">
              {iconSuggestions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
                    formData.icon === icon
                      ? 'border-[hsl(42,50%,54%)] bg-[hsl(42,50%,54%,0.15)] scale-110'
                      : 'border-[hsl(260,15%,14%)] bg-[hsl(260,20%,10%)] hover:border-[hsl(42,50%,54%,0.5)] hover:scale-105'
                  }`}
                >
                  {icon}
                </button>
              ))}
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-12 h-12 bg-[hsl(260,20%,8%)] text-center text-2xl border-2 border-[hsl(260,15%,14%)] rounded-lg focus:border-[hsl(42,50%,54%,0.3)] outline-none transition-all"
                maxLength={2}
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">
              Nom du rôle *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)] border border-[hsl(260,15%,14%)] rounded-lg px-4 py-3 text-sm focus:border-[hsl(42,50%,54%,0.3)] focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.15)] transition-all placeholder:text-[hsl(260,10%,25%)]"
              placeholder="Ex: Maître Stratège"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)] border border-[hsl(260,15%,14%)] rounded-lg px-4 py-3 text-sm focus:border-[hsl(42,50%,54%,0.3)] focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.15)] transition-all placeholder:text-[hsl(260,10%,25%)]"
              placeholder="Description courte du rôle"
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">
              Prompt système *
            </label>
            <textarea
              required
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              className="w-full bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)] border border-[hsl(260,15%,14%)] rounded-lg px-4 py-3 text-sm resize-none focus:border-[hsl(42,50%,54%,0.3)] focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.15)] transition-all placeholder:text-[hsl(260,10%,25%)]"
              rows={6}
              placeholder="Tu es un expert en stratégie militaire. Tu analyses les situations avec une perspective tactique et fournis des conseils pragmatiques..."
              minLength={10}
            />
            <p className="text-xs text-[hsl(42,30%,45%)]">
              Définissez le comportement et l'expertise de l'IA (min. 10 caractères)
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">
              Catégorie
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['custom', 'work', 'creative', 'learning', 'coding', 'strategy'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                    formData.category === cat
                      ? 'bg-[hsl(270,50%,40%,0.2)] text-[hsl(42,50%,54%)] border-[hsl(270,50%,40%,0.3)]'
                      : 'bg-[hsl(260,20%,10%)] text-[hsl(42,30%,65%)] border-[hsl(260,15%,14%)] hover:border-[hsl(42,50%,54%,0.3)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">
              Visibilité
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'private' })}
                className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all border flex items-center gap-2 justify-center ${
                  formData.visibility === 'private'
                    ? 'bg-[hsl(0,60%,35%,0.2)] text-[hsl(42,50%,54%)] border-[hsl(0,60%,35%,0.3)]'
                    : 'bg-[hsl(260,20%,10%)] text-[hsl(42,30%,65%)] border-[hsl(260,15%,14%)] hover:border-[hsl(42,50%,54%,0.3)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Privé
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'shared' })}
                className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all border flex items-center gap-2 justify-center ${
                  formData.visibility === 'shared'
                    ? 'bg-[hsl(142,70%,36%,0.2)] text-[hsl(42,50%,54%)] border-[hsl(142,70%,36%,0.3)]'
                    : 'bg-[hsl(260,20%,10%)] text-[hsl(42,30%,65%)] border-[hsl(260,15%,14%)] hover:border-[hsl(42,50%,54%,0.3)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Partagé
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-[hsl(260,15%,14%)] flex gap-3 justify-end bg-[hsl(260,25%,7%)]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 bg-[hsl(260,20%,10%)] hover:bg-[hsl(260,15%,14%)] text-[hsl(42,30%,65%)] rounded-lg font-semibold transition-all border border-[hsl(260,15%,14%)] disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[hsl(0,60%,30%)] to-[hsl(0,60%,35%)] hover:from-[hsl(0,60%,35%)] hover:to-[hsl(0,60%,40%)] text-[hsl(42,50%,70%)] rounded-lg font-bold transition-all border border-[hsl(0,50%,40%,0.3)] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,0,0,0.2)] active:scale-95 flex items-center gap-2 text-sm uppercase tracking-wide"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-[hsl(42,50%,54%,0.3)] border-t-[hsl(42,50%,54%)] rounded-full animate-spin"></div>
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{roleToEdit ? 'Modifier' : 'Créer'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { 
          width: 6px; 
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