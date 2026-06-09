// proxy.ts  ← raíz del proyecto (mismo nivel que /app)
// Next.js 16 renombró middleware.ts → proxy.ts
// La función exportada debe llamarse `proxy`, no `middleware`.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // ── 1. Response base ──────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  // ── 2. Cliente Supabase ligado a las cookies del request ──────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Paso A: aplica las cookies al objeto request
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Paso B: reconstruye la response CON el request ya actualizado
          // (esto es lo que estaba roto en la versión anterior)
          supabaseResponse = NextResponse.next({ request });
          // Paso C: escribe las cookies en la response que llega al navegador
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── 3. Refresca la sesión ─────────────────────────────────────────────────
  // No mover, no borrar. Refresca el access token si expiró
  // y escribe las cookies actualizadas vía setAll() de arriba.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
