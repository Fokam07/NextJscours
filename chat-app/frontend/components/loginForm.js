// loginForm-responsive.js
"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { createSupabaseBrowserClient } from "@/backend/lib/supabaseClient";

export default function LoginForm({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // "google" | "github" | null
  const [socialError, setSocialError] = useState(null);

  const { error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSocialError(null);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          {/* Logo/Icon responsive */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Connexion
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Accédez à votre chatbot IA
          </p>
        </div>

        {/* ✅ Social buttons */}
        <div className="space-y-3 mb-5 sm:mb-6">
          {socialError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm">
              {socialError}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={isAnyLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base shadow-sm"
          >
            {socialLoading === "google" ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              // simple G icon
              <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-700">
                G
              </span>
            )}
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs sm:text-sm text-gray-500">ou</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
        </div>

        {/* ✅ Email/Password form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="votre@email.com"
              required
              disabled={isAnyLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
              disabled={isAnyLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isAnyLoading}
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Pas encore de compte ?{" "}
            <button
              onClick={onSwitchToRegister}
              disabled={isAnyLoading}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline disabled:opacity-50"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
