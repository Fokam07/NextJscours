"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/backend/lib/supabaseClient";

export default function AuthFinishPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Finalisation de la connexion...");

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        // 1) vérifier qu’on a une session
        const { data: sessionData, error: sessError } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (sessError) {
          setStatus("Erreur session: " + sessError.message);
          await new Promise(r => setTimeout(r, 2000));
          router.replace("/");
          return;
        }

        if (!session?.user) {
          setStatus("Session introuvable, retour login...");
          await new Promise(r => setTimeout(r, 2000));
          router.replace("/");
          return;
        }

        setStatus("Session trouvée, création utilisateur...");

        // 2) créer/récupérer l'utilisateur dans Prisma via ton API
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
          cache: "no-store",
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json?.success || !json?.user?.id) {
          setStatus("Erreur création user: " + (json?.error || "unknown"));
          await new Promise(r => setTimeout(r, 2000));
          router.replace("/");
          return;
        }

        // 3) stocker ton userId local (si ton app en a besoin)
        localStorage.setItem("chat_user_id", json.user.id);

        // 4) IMPORTANT: attendre un peu que onAuthStateChange déclenche le hook useAuth()
        setStatus("Attente sync...");
        await new Promise(r => setTimeout(r, 2000));

        // 5) redirection vers la page d'accueil 
        router.replace("/");
      } catch (e) {
        setStatus("Erreur: " + e.message);
        await new Promise(r => setTimeout(r, 2000));
        router.replace("/");
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">{status}</p>
    </div>
  );
}


