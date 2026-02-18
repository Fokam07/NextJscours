import { createBrowserClient } from "@supabase/ssr";

let browserClient; // ✅ singleton

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes");
  }

  browserClient = createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // 🔥 IMPORTANT pour OAuth!
    },
  });
  return browserClient;
}

// Export alias pour compatibilité
export function getSupabaseBrowserClient() {
  return createSupabaseBrowserClient();
}



