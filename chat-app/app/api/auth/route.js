import { NextResponse } from "next/server";
import { userService } from "@/backend/services/user.service";
import { createSupabaseServerClient } from "@/backend/lib/supabaseServer";

export const dynamic = "force-dynamic"; // ✅ important pour cookies/session

export async function POST(req) {
  try {
    console.log("🔍 /api/auth: Requête reçue");
    
    // 0) body optionnel (au cas où)
    const body = await req.json().catch(() => ({}));
    const emailFromBody = body?.email || null;

    console.log("📋 /api/auth: emailFromBody=", emailFromBody);

    // 1) Ancien flow (header) + fallback body
    let id = req.headers.get("x-user-id") || null;
    let email = emailFromBody || null;

    console.log("🔐 /api/auth: Avant Supabase - id=", id, "email=", email);

    // 2) OAuth flow : si pas d'id/email -> lire session Supabase via cookies
    if (!id || !email) {
      console.log("🔄 /api/auth: Lecture session Supabase...");
      const supabase = createSupabaseServerClient();

      const { data, error } = await supabase.auth.getUser();

      console.log("📤 /api/auth getUser result:", { hasUser: !!data?.user, hasError: !!error });

      if (error || !data?.user) {
        console.error("❌ /api/auth: Session Supabase introuvable");
        // Ne pas utiliser 401 - essayer quand même avec ce qu'on a
        if (!email && !id) {
          return NextResponse.json(
            { success: false, error: "Session Supabase introuvable. Reconnecte-toi." },
            { status: 401 }
          );
        }
        // Sinon continuer avec email/id du body
      } else {
        const sbUser = data.user;
        id = id || sbUser.id;
        email = email || sbUser.email || null;
        console.log("✅ /api/auth: Session Supabase trouvée -", sbUser.email);
      }
    }

    // 3) Validation
    if (!id) {
      console.error("❌ /api/auth: ID utilisateur manquant");
      return NextResponse.json(
        { success: false, error: "ID utilisateur manquant" },
        { status: 400 }
      );
    }

    // ⚠️ Certains providers peuvent ne pas renvoyer email (rare sur Google, possible ailleurs)
    if (!email) {
      console.warn("⚠️ /api/auth: Email manquant, création avec fallback");
      // Permettre la création sans email pour Google OAuth parfois
      email = `user_${id}@oauth.local`;
    }

    console.log("✅ /api/auth: Appel userService avec id=", id, "email=", email);

    // 4) Prisma: crée ou récupère l'utilisateur
    const user = await userService.findOrCreateIfNotExist({ email, id });

    console.log("✅ /api/auth: Utilisateur créé/trouvé -", user.email);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("❌ /api/auth catch error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}


