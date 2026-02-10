'use client'

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/backend/lib/supabase';

const authContext = createContext();

export const AuthProvider = ({children}) =>{
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("use auth est appele");

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if(session?.user){
        const userDb = await findOrCreateUser(session.user.id, session.user.email);
        setUser(userDb??null);
      }
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if(session?.user){
          const userDb = await findOrCreateUser(session.user.id, session.user.email);
          setUser(userDb??null);
        }else{
          setUser(null);
        }
      } catch (error) {
        setError(error.message);
      }
      finally{
        setLoading(false);
        console.log("loading est mis a jour", loading)
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const saveUser = async (id, email, username) => {
      const res = await fetch('/api/auth/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email, username }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur inscription');
      }

      setUser(data.user);
      return data.user;
  }

  const findOrCreateUser = async (id, email) => {
      const res = await fetch(`/api/auth`, {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
          'x-user-id':id
        },
        body:JSON.stringify({email}),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur récupération utilisateur');
      }

      return data.user;
  }

  const signUp = async (email, password, username) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
      });
      console.log('data signup:', data);
      if (error) {
        console.error('Erreur inscription:', error);
        setError(error.message);
        return false;
      }else{
        const user = await saveUser(data.user.id, email, username);
        setUser(user);
        return true;
      }
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
};

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error);
        
      }
      console.log("les data supabase", data.user);
      const user =  await findOrCreateUser(data.user.id, data.user.email);
      setUser(user);
    } catch (error) {
      setError(error.message);
    } finally {
      console.log("loadiing mis a jour");
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        return false;
      }
      setUser(null);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return <authContext.Provider value={{
    user,
    loading,
    signUp,
    signIn,
    signOut,
    err:error
  }}>{children}</authContext.Provider>
}

export function useAuth() {
  if(authContext){
    return useContext(authContext);
  }
  throw new Error("authContext est null verifier que vous avez ajouter le provider");
  
}