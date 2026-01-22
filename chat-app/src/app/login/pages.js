'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../../frontend/styles/styles.css' // Importez votre fichier de styles ici

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // seulement pour register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email, password }
      : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include', // très important pour cookies
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      // Succès → redirection vers chat
      router.push('/');
      router.refresh(); // force rechargement pour voir le user
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h1>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="auth-label">Nom / Pseudo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          <div>
            <label className="auth-label">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Pas de compte ?" : 'Déjà un compte ?'}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="auth-toggle-button"
          >
            {isLogin ? "S'inscrire" : 'Se connecter'}
          </span>
        </p>
      </div>
    </div>
  );
}