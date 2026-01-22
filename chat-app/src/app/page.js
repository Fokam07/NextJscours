// app/page.js   ou app/page.jsx
'use client';  // Important : on passe en client component pour fetch + useEffect

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/frontend/components/Chat';  // adapte le chemin si besoin

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Récupère les infos utilisateur au chargement de la page
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // pour envoyer les cookies
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erreur récupération user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Optionnel : si pas connecté → on peut rediriger vers /login
  // Décommente si tu veux forcer la connexion
  /*
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  */

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST', // ou GET selon ton backend
        credentials: 'include',
      });

      if (res.ok) {
        setUser(null);
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Erreur logout:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Chat simple avec IA
        </h1>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700 font-medium">
                {user.name || user.email?.split('@')[0] || 'Utilisateur'}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Se connecter / S'inscrire
            </a>
          )}
        </div>
      </header>

      <div className="flex-1">
        {user ? (
          <Chat />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
            <p className="text-lg mb-4">Connectez-vous pour accéder au chat</p>
            <a
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Aller à la connexion
            </a>
          </div>
        )}
      </div>
    </main>
  );
}