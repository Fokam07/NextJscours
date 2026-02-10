// registerform-responsive.js - Thème Overlord / Nazarick
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function RegisterForm({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { err, loading: isLoading } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    if (formData.email !== '' && formData.password !== '') {
      setError(err);
    }
    setLoading(isLoading);
  }, [err, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const { error } = await onRegister(formData.email, formData.password, formData.username);
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(260,28%,8%)] to-[hsl(260,22%,5%)] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Motif subtil Nazarick */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 3px 3px, hsl(42,50%,54%) 1px, transparent 0)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative bg-[hsl(260,25%,9%)] p-6 sm:p-8 rounded-2xl border border-[hsl(260,15%,18%)] shadow-[0_0_40px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(139,0,0,0.12)] w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          {/* Icône Nazarick */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-[hsl(0,60%,30%)] to-[hsl(0,60%,38%)] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,0,0,0.5)] border border-[hsl(0,60%,40%,0.3)]">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(42,50%,70%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[hsl(42,65%,60%)] tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]">
            Inscription
          </h1>
          <p className="text-sm sm:text-base text-[hsl(42,30%,65%)] mt-2">
            Rejoignez les rangs de Nazarick
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="bg-[hsl(0,60%,28%,0.25)] border border-[hsl(0,60%,40%,0.4)] text-[hsl(0,70%,75%)] px-4 py-3 rounded-xl text-sm shadow-inner">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[hsl(42,65%,58%)] uppercase tracking-[0.2em] mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 text-base bg-[hsl(260,28%,7%)] border-2 border-[hsl(260,15%,18%)] rounded-xl text-[hsl(42,40%,85%)] placeholder-[hsl(42,20%,35%)] focus:border-[hsl(42,70%,50%)] focus:shadow-[0_0_20px_rgba(212,175,55,0.25)] focus:outline-none transition-all"
              placeholder="john_doe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[hsl(42,65%,58%)] uppercase tracking-[0.2em] mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 text-base bg-[hsl(260,28%,7%)] border-2 border-[hsl(260,15%,18%)] rounded-xl text-[hsl(42,40%,85%)] placeholder-[hsl(42,20%,35%)] focus:border-[hsl(42,70%,50%)] focus:shadow-[0_0_20px_rgba(212,175,55,0.25)] focus:outline-none transition-all"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[hsl(42,65%,58%)] uppercase tracking-[0.2em] mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 text-base bg-[hsl(260,28%,7%)] border-2 border-[hsl(260,15%,18%)] rounded-xl text-[hsl(42,40%,85%)] placeholder-[hsl(42,20%,35%)] focus:border-[hsl(42,70%,50%)] focus:shadow-[0_0_20px_rgba(212,175,55,0.25)] focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-[hsl(42,35%,50%)] mt-1.5 italic">
              Au moins 6 caractères
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[hsl(42,65%,58%)] uppercase tracking-[0.2em] mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 text-base bg-[hsl(260,28%,7%)] border-2 border-[hsl(260,15%,18%)] rounded-xl text-[hsl(42,40%,85%)] placeholder-[hsl(42,20%,35%)] focus:border-[hsl(42,70%,50%)] focus:shadow-[0_0_20px_rgba(212,175,55,0.25)] focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[hsl(0,65%,32%)] to-[hsl(0,60%,38%)] hover:from-[hsl(0,75%,38%)] hover:to-[hsl(0,75%,42%)] text-[hsl(42,70%,82%)] py-3 rounded-xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(200,40,40,0.4)] hover:shadow-[0_0_35px_rgba(200,40,40,0.6)] active:scale-[0.98] border border-[hsl(0,70%,45%,0.3)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-[hsl(42,70%,80%)]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Invocation en cours...
              </span>
            ) : (
              'Créer mon serviteur'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[hsl(42,30%,65%)]">
            Déjà un serviteur ?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[hsl(42,70%,65%)] hover:text-[hsl(42,80%,75%)] font-bold hover:underline transition-colors"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}