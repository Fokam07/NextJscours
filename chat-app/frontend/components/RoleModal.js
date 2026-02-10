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
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Récupérer l'utilisateur authentifié
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setErrors({ submit: 'Vous devez être connecté pour créer un rôle' });
        setIsSaving(false);
        return;
      }

      let result;
      
      if (roleToEdit) {
        // Mise à jour d'un rôle existant
        result = await supabase
          .from('roles')
          .update({
            name: formData.name,
            system_prompt: formData.system_prompt,
            description: formData.description,
            icon: formData.icon,
            category: formData.category,
            visibility: formData.visibility,
            updated_at: new Date().toISOString()
          })
          .eq('id', roleToEdit.id)
          .select()
          .single();
      } else {
        // Création d'un nouveau rôle - UTILISE VOS COLONNES EXACTES
        result = await supabase
          .from('roles')
          .insert([{
            name: formData.name,
            system_prompt: formData.system_prompt,
            description: formData.description,
            icon: formData.icon,
            category: formData.category,
            userid: user.id,              // ← votre colonne
            visibility: formData.visibility,
            is_active: true,               // ← votre colonne
            usage_count: 0,                // ← votre colonne
            // created_at et updated_at sont auto-générés par Supabase
          }])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Erreur Supabase:', result.error);
        setErrors({ submit: result.error.message || 'Erreur lors de la sauvegarde' });
      } else {
        onSave(result.data);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">{formData.icon}</span>
              {roleToEdit ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Icône */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icône du rôle
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-4xl transition-colors border-2 border-gray-700 hover:border-purple-500"
              >
                {formData.icon}
              </button>
              {showEmojiPicker && (
                <div className="flex flex-wrap gap-2 flex-1 p-3 bg-gray-800 rounded-xl border border-gray-700">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        handleChange('icon', emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-10 h-10 hover:bg-gray-700 rounded-lg flex items-center justify-center text-2xl transition-colors"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom du rôle *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Expert en Python"
              className={`w-full bg-gray-800 text-white px-4 py-3 rounded-xl border ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all`}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.name.length}/100 caractères
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optionnel)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Ex: Spécialisé en développement Python et frameworks web"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all cursor-pointer"
            >
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prompt système * 
              <span className="text-gray-500 text-xs ml-2">(Définit le comportement de l'IA)</span>
            </label>
            <textarea
              value={formData.system_prompt}
              onChange={(e) => handleChange('system_prompt', e.target.value)}
              placeholder="Ex: Tu es un expert en programmation Python avec plus de 10 ans d'expérience. Tu fournis du code propre, bien commenté et tu expliques tes solutions de manière pédagogique..."
              rows={8}
              className={`w-full bg-gray-800 text-white px-4 py-3 rounded-xl border ${
                errors.system_prompt ? 'border-red-500' : 'border-gray-700'
              } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all resize-none font-mono text-sm`}
            />
            {errors.system_prompt && (
              <p className="text-red-400 text-sm mt-1">{errors.system_prompt}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Ce texte définit la personnalité et le comportement de l'IA. Soyez précis et détaillé.
            </p>
          </div>

          {/* Visibilité */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visibilité
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('visibility', 'private')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                  formData.visibility === 'private'
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">Privé</span>
                </div>
                <p className="text-xs mt-1">Visible uniquement par vous</p>
              </button>
              
              <button
                type="button"
                onClick={() => handleChange('visibility', 'shared')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                  formData.visibility === 'shared'
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">Partageable</span>
                </div>
                <p className="text-xs mt-1">Peut être partagé avec d'autres</p>
              </button>
            </div>
          </div>

          {/* Erreur globale */}
          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-4">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl transition-colors font-medium border border-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{roleToEdit ? 'Mettre à jour' : 'Créer le rôle'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}