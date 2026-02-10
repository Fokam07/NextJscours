// frontend/components/RoleModal.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../backend/lib/supabase';

const EMOJI_OPTIONS = ['🤖', '💻', '💪', '📚', '✈️', '👨‍🍳', '🧠', '💼', '🎨', '🎮', '⚽', '🎵', '📊', '🔬', '🏴‍☠️', '🧙‍♂️', '👑', '🦸‍♂️'];
const CATEGORY_OPTIONS = [
  { value: 'general', label: 'Général' },
  { value: 'tech', label: 'Technologie' },
  { value: 'health', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'business', label: 'Business' },
  { value: 'lifestyle', label: 'Style de vie' },
  { value: 'fun', label: 'Divertissement' },
  { value: 'custom', label: 'Personnalisé' },
];

export default function RoleModal({ isOpen, onClose, onSave, roleToEdit = null }) {
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    description: '',
    icon: '🤖',
    category: 'custom',
    visibility: 'private',
  });
  
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (roleToEdit) {
      setFormData({
        name: roleToEdit.name || '',
        system_prompt: roleToEdit.system_prompt || '',
        description: roleToEdit.description || '',
        icon: roleToEdit.icon || '🤖',
        category: roleToEdit.category || 'custom',
        visibility: roleToEdit.visibility || 'private',
      });
    } else {
      setFormData({
        name: '',
        system_prompt: '',
        description: '',
        icon: '🤖',
        category: 'custom',
        visibility: 'private',
      });
    }
  }, [roleToEdit, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Le nom ne peut pas dépasser 100 caractères';
    }

    if (!formData.system_prompt.trim()) {
      newErrors.system_prompt = 'Le prompt système est requis';
    } else if (formData.system_prompt.length < 10) {
      newErrors.system_prompt = 'Le prompt doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Récupérer l'utilisateur via Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setErrors({ submit: 'Vous devez être connecté pour créer un rôle' });
        return;
      }

      // CORRECTION : passer par l'API Next.js (pas Supabase direct)
      // Cela garantit que roleService enregistre bien userid et is_active
      const url = roleToEdit ? `/api/roles/${roleToEdit.id}` : '/api/roles';
      const method = roleToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          name: formData.name,
          system_prompt: formData.system_prompt,
          description: formData.description,
          icon: formData.icon,
          category: formData.category,
          visibility: formData.visibility,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur API roles:', data);
        setErrors({ submit: data.error || 'Erreur lors de la sauvegarde' });
      } else {
        onSave(data.role);
        onClose();
      }
    } catch (error) {
      console.error('Erreur sauvegarde rôle:', error);
      setErrors({ submit: 'Erreur de connexion au serveur' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#0c1220] rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/[0.08] custom-scrollbar ring-1 ring-white/[0.04]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 p-6 rounded-t-2xl backdrop-blur-sm border-b border-white/10 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 tracking-tight">
              <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white/15 rounded-xl ring-1 ring-white/20">{formData.icon}</span>
              {roleToEdit ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-all duration-200 p-2 hover:bg-white/10 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Icône */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">
              Icône du rôle
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl flex items-center justify-center text-3xl transition-all duration-300 border border-white/[0.08] hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] ring-1 ring-white/[0.03]"
              >
                {formData.icon}
              </button>
              {showEmojiPicker && (
                <div className="flex flex-wrap gap-1.5 flex-1 p-3 bg-white/[0.03] rounded-xl border border-white/[0.08]">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        handleChange('icon', emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-9 h-9 hover:bg-white/[0.08] rounded-lg flex items-center justify-center text-xl transition-all duration-200 hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Nom du rôle *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Expert en Python"
              className={`w-full bg-white/[0.04] text-gray-200 px-4 py-3 rounded-xl border ${
                errors.name ? 'border-red-500/40' : 'border-white/[0.08]'
              } focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 text-sm placeholder:text-gray-600`}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.name}</p>
            )}
            <p className="text-gray-600 text-[11px] mt-1.5 font-medium">
              {formData.name.length}/100 caractères
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Description (optionnel)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Ex: Spécialisé en développement Python et frameworks web"
              className="w-full bg-white/[0.04] text-gray-200 px-4 py-3 rounded-xl border border-white/[0.08] focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 text-sm placeholder:text-gray-600"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full bg-white/[0.04] text-gray-200 px-4 py-3 rounded-xl border border-white/[0.08] focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 cursor-pointer text-sm"
            >
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat.value} value={cat.value} className="bg-[#0c1220] text-gray-200">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Prompt système * 
              <span className="text-gray-600 normal-case tracking-normal font-normal ml-2">(Définit le comportement de l'IA)</span>
            </label>
            <textarea
              value={formData.system_prompt}
              onChange={(e) => handleChange('system_prompt', e.target.value)}
              placeholder="Ex: Tu es un expert en programmation Python avec plus de 10 ans d'expérience. Tu fournis du code propre, bien commenté et tu expliques tes solutions de manière pédagogique..."
              rows={8}
              className={`w-full bg-white/[0.04] text-gray-200 px-4 py-3 rounded-xl border ${
                errors.system_prompt ? 'border-red-500/40' : 'border-white/[0.08]'
              } focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 resize-none font-mono text-sm placeholder:text-gray-600 leading-relaxed`}
            />
            {errors.system_prompt && (
              <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.system_prompt}</p>
            )}
            <p className="text-gray-600 text-[11px] mt-1.5 font-medium">
              Ce texte définit la personnalité et le comportement de l'IA. Soyez précis et détaillé.
            </p>
          </div>

          {/* Visibilité */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">
              Visibilité
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('visibility', 'private')}
                className={`flex-1 py-3.5 px-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.visibility === 'private'
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.08)]'
                    : 'border-white/[0.06] bg-white/[0.02] text-gray-500 hover:border-white/[0.12] hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium text-sm">Privé</span>
                </div>
                <p className="text-[11px] mt-1.5 opacity-60 font-medium">Visible uniquement par vous</p>
              </button>
              
              <button
                type="button"
                onClick={() => handleChange('visibility', 'shared')}
                className={`flex-1 py-3.5 px-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.visibility === 'shared'
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.08)]'
                    : 'border-white/[0.06] bg-white/[0.02] text-gray-500 hover:border-white/[0.12] hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium text-sm">Partageable</span>
                </div>
                <p className="text-[11px] mt-1.5 opacity-60 font-medium">Peut être partagé avec d'autres</p>
              </button>
            </div>
          </div>

          {/* Erreur globale */}
          {errors.submit && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-400 text-sm font-medium">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 py-3 px-6 rounded-xl transition-all duration-300 font-medium border border-white/[0.08] hover:border-white/[0.12] text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white py-3 px-6 rounded-xl transition-all duration-300 font-medium shadow-lg shadow-cyan-500/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{roleToEdit ? 'Mettre à jour' : 'Créer le rôle'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.08); border-radius: 20px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.15); }
        `}</style>
      </div>
    </div>
  );
}