// app/login/page.jsx   ou   app/auth/page.jsx (selon ton choix)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include', // indispensable pour les cookies httpOnly
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // Succès → redirection + refresh pour recharger le layout/user
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h1>

        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-6 text-center text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom / Pseudo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Votre nom"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="exemple@domaine.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="••••••••"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-white transition
              ${loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}
            `}
          >
            {loading 
              ? 'Connexion en cours...' 
              : isLogin 
                ? 'Se connecter' 
                : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Pas encore de compte ?" : 'Déjà inscrit ?'}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setName('');
            }}
            className="ml-2 text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
          >
            {isLogin ? "S'inscrire" : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}