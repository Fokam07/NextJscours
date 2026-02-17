// loginForm-responsive.js - Thème Overlord / Nazarick
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginForm({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loading: isLoading, err } = useAuth();

  useEffect(() => {
    if (email !== '' && password !== '') {
      setError(err);
    }
    setLoading(isLoading);
  }, [err, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(email, password);
    if (!success) {
      console.log("Échec de la connexion");
    }

    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    try {
      setSocialError(null);
      setSocialLoading(provider);

      const supabase = createSupabaseBrowserClient();

      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider, // "google" | "github"
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // Après ça, Supabase redirige automatiquement -> /auth/callback
    } catch (err) {
      setSocialError(err?.message || "Erreur connexion sociale");
      setSocialLoading(null);
    }
  };

  const isAnyLoading = loading || !!socialLoading;

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[hsl(42,65%,60%)] tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]">
            Connexion
          </h1>
          <p className="text-sm sm:text-base text-[hsl(42,30%,65%)] mt-2">
            Accédez à la Grande Tombe de Nazarick
          </p>
        </div>

        {/* ✅ Email/Password form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="bg-[hsl(0,60%,28%,0.25)] border border-[hsl(0,60%,40%,0.4)] text-[hsl(0,70%,75%)] px-4 py-3 rounded-xl text-sm shadow-inner">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[hsl(42,65%,58%)] uppercase tracking-[0.2em] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-base bg-[hsl(260,28%,7%)] border-2 border-[hsl(260,15%,18%)] rounded-xl text-[hsl(42,40%,85%)] placeholder-[hsl(42,20%,35%)] focus:border-[hsl(42,70%,50%)] focus:shadow-[0_0_20px_rgba(212,175,55,0.25)] focus:outline-none transition-all"
              placeholder="votre@email.com"
              required
              disabled={isAnyLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[hsl(42,65%,58%)] uppercase tracking-[0.2em] mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base bg-[hsl(260,28%,7%)] border-2 border-[hsl(260,15%,18%)] rounded-xl text-[hsl(42,40%,85%)] placeholder-[hsl(42,20%,35%)] focus:border-[hsl(42,70%,50%)] focus:shadow-[0_0_20px_rgba(212,175,55,0.25)] focus:outline-none transition-all"
              placeholder="••••••••"
              required
              disabled={isAnyLoading}
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
                Connexion en cours...
              </span>
            ) : (
              'Entrer dans Nazarick'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[hsl(42,30%,65%)]">
            Pas encore de compte ?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-[hsl(42,70%,65%)] hover:text-[hsl(42,80%,75%)] font-bold hover:underline transition-colors"
            >
              Invoquer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
