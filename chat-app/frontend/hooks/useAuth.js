import { useState, useEffect } from "react";
import { createSupabaseBrowserClient as getSupabaseBrowserClient } from "@/backend/lib/supabaseClient"; // ✅ Utiliser le MÊME client partout!

export function useAuth() {
  const [user, setUser] = useState(null); // ✅ Prisma user (app)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const findOrCreateUser = async (id, email) => {
    const res = await fetch(`/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": id, // ton ancien flow
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Erreur récupération utilisateur");
    }

    return data.user; // Prisma user
  };

  const saveUser = async (id, email, username) => {
    const res = await fetch("/api/auth/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email, username }),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Erreur inscription");
    }

    return data.user; // Prisma user
  };

  // ✅ Fonction centrale : session Supabase -> user Prisma
  const syncFromSupabaseSession = async (session) => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    const sbUser = session.user;
    const appUser = await findOrCreateUser(sbUser.id, sbUser.email);
    setUser(appUser);
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    (async () => {
      try {
        // 🔄 Refrescar sesión PRIMERO (por si recibimos cookies nuevas del servidor)
        await supabase.auth.refreshSession();
        
        // 1) Obtener session actual (incluyendo tokens refrescados)
        const { data: { session } } = await supabase.auth.getSession();
        
        await syncFromSupabaseSession(session);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();

    // 2) Escuchar cambios de auth  (OAuth / refresh / signout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          await syncFromSupabaseSession(session);
        } catch (e) {
          setError(e.message);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, username) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) {
        setError(error.message);
        return false;
      }

      // ✅ créer user Prisma
      const appUser = await saveUser(data.user.id, email, username);
      setUser(appUser);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return false;
      }

      // ✅ sync Prisma
      const appUser = await findOrCreateUser(data.user.id, data.user.email);
      setUser(appUser);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return false;
      }

      setUser(null);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signUp, signIn, signOut };
}
