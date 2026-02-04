'use client';

import { useState } from 'react';
import { Share2, Link2, Check, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

export default function ShareButtons({ 
  url, 
  title = 'Découvrez cette application de chat',
  className = '' 
}) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Utiliser l'URL actuelle si non fournie
  const shareUrl = typeof window !== 'undefined' 
    ? url || window.location.href 
    : url || '';
  
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  // Copier le lien
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  // Web Share API (natif mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
        setShowMenu(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Erreur lors du partage:', err);
        }
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600 bg-blue-500'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-sky-600 bg-sky-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-700 bg-blue-600'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: 'hover:bg-gray-600 bg-gray-500'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal de partage */}
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
        aria-label="Partager"
      >
        <Share2 size={18} />
        <span className="text-sm font-medium">Partager</span>
      </button>

      {/* Menu déroulant pour desktop */}
      {showMenu && !navigator.share && (
        <>
          {/* Overlay pour fermer le menu */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
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
                <span className="text-sm font-medium text-gray-700">
                  {platform.name}
                </span>
              </a>
            ))}
            
            {/* Bouton copier le lien */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-full ${
                  copied ? 'bg-green-500' : 'bg-gray-700'
                } text-white`}>
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