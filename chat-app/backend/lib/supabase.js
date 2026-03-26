// ✅ ALIAS vers supabaseClient.js pour éviter deux instances
// Tous les clients doivent utiliser le même singleton!
export { createSupabaseBrowserClient, getSupabaseBrowserClient } from "./supabaseClient";

