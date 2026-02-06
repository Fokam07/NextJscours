'use client';

import { useState, useEffect } from 'react';
import { Share2, Link2, Check, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Créer le client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ShareButtons({
  conversationId,
  title = 'Découvrez cette conversation',
  className = '',
}) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[ShareButtons] conversationId changé :', {
      value: conversationId,
      isTruthy: !!conversationId,
      type: typeof conversationId,
      length: typeof conversationId === 'string' ? conversationId.length : 'N/A',
      isValidUuid: typeof conversationId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId),
    });
  }, [conversationId]);

  const generateOrGetShareLink = async () => {
    if (!conversationId || typeof conversationId !== 'string' || conversationId.length === 0) {
      setError('Aucune conversation sélectionnée ou ID invalide');
      console.warn('[ShareButtons] generateOrGetShareLink bloqué : conversationId invalid');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('[ShareButtons] Début génération pour ID valide :', conversationId);

    try {
      // 🔥 RÉCUPÉRER LA SESSION ET LE TOKEN
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('[ShareButtons] Session:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userId: session?.user?.id
      });

      if (!session?.access_token) {
        throw new Error('Vous devez être connecté pour partager une conversation');
      }

      // 🔥 ENVOYER LE TOKEN DANS LE HEADER AUTHORIZATION
      const res = await fetch(`/api/conversations/${conversationId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // ← TOKEN ICI
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du lien');
      }

      setShareUrl(data.shareUrl);
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      if (!navigator.share) {
        setShowMenu(true);
      }
    } catch (err) {
      console.error('[ShareButtons] Erreur génération :', err);
      setError(err.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const handleNativeShare = async () => {
    if (loading) return;

    console.log('[ShareButtons] Clic - État :', {
      loading,
      hasValidId: !!conversationId && typeof conversationId === 'string' && conversationId.length > 0,
      hasShareUrl: !!shareUrl,
    });

    if (!shareUrl) {
      await generateOrGetShareLink();
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[ShareButtons] Erreur partage natif :', err);
        }
      }
    } else {
      setShowMenu(true);
    }
  };

  const encodedUrl = shareUrl ? encodeURIComponent(shareUrl) : '';
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'hover:bg-blue-600 bg-blue-500' },
    { name: 'Twitter',   icon: Twitter,   url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, color: 'hover:bg-sky-600 bg-sky-500' },
    { name: 'LinkedIn',  icon: Linkedin,  url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: 'hover:bg-blue-700 bg-blue-600' },
    { name: 'Email',     icon: Mail,      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`, color: 'hover:bg-gray-600 bg-gray-500' },
  ];

  const isDisabled = loading || !conversationId || typeof conversationId !== 'string' || conversationId.length === 0;
  let disableReason = '';
  if (loading) disableReason = 'Génération en cours...';
  else if (!conversationId) disableReason = 'ID conversation manquant';
  else if (typeof conversationId !== 'string') disableReason = 'ID conversation pas une chaîne de caractères';
  else if (conversationId.length === 0) disableReason = 'ID conversation vide';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        disabled={isDisabled}
        title={disableReason || 'Partager cette conversation'}
        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm ${
          isDisabled
            ? 'bg-gray-400 cursor-not-allowed opacity-70'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
        }`}
        aria-label="Partager cette conversation"
      >
        <Share2 size={18} />
        <span className="text-sm font-medium">
          {loading ? 'Génération...' : 'Partager'}
        </span>
      </button>

      {error && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-red-100 text-red-800 rounded text-sm max-w-xs z-50">
          {error}
        </div>
      )}

      {showMenu && shareUrl && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2 border border-gray-200">
            <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-200">
              Partager via
            </div>

            {shareLinks.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className={`p-2 rounded-full ${platform.color} text-white`}>
                  <platform.icon size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">{platform.name}</span>
              </a>
            ))}

            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-full ${copied ? 'bg-green-500' : 'bg-gray-700'} text-white`}>
                  {copied ? <Check size={16} /> : <Link2 size={16} />}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {copied ? 'Lien copié !' : 'Copier le lien'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}