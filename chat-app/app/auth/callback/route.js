import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { userService } from "@/backend/services/user.service";

export async function GET(request) {
  const url = new URL(request.url);
  try {
    const code = url.searchParams.get("code");

    if (!code) {
      console.error("❌ /auth/callback: code OAuth manquant");
      return NextResponse.redirect(new URL("/", url.origin));
    }

    const cookieStore = cookies();
    const response = NextResponse.redirect(new URL("/", url.origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error || !data?.user) {
      return NextResponse.redirect(new URL("/", url.origin));
    }

    // ✅ Créer ou obtenir l'utilisateur Prisma CÔTÉ SERVEUR
    try {
      const email = data.user.email || `user_${data.user.id}@oauth.local`;
      await userService.findOrCreateIfNotExist({ email, id: data.user.id });
    } catch (prismaError) {
      // Silently continue if Prisma sync fails
    }
    
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/", url.origin));
  }
}


