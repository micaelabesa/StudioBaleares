// app/api/stripe/plan/route.ts
//
// Endpoint dedicado a leer el plan actual del usuario.
// Usa supabaseAdmin (service role) para saltarse RLS y cualquier caché
// del cliente browser. La página /studio/success hace polling aquí
// en vez de llamar a refreshPlan() desde el contexto, que usaba el
// cliente browser con sesión potencialmente stale tras el redirect de Stripe.

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_req: NextRequest) {
  // 1. Verificar sesión con el cliente server (lee cookies del request)
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Leer el plan con service role — ignora RLS, siempre fresco
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("plan, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    plan:               profile.plan,
    stripe_customer_id: profile.stripe_customer_id ?? null,
  });
}
