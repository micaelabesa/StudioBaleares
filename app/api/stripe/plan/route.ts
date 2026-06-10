import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  // 1. Verificar sesión
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Leer perfil actual
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("plan, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 3. Si ya es Pro, devolver directamente
  if (profile.plan === "pro") {
    return NextResponse.json({ plan: "pro", stripe_customer_id: profile.stripe_customer_id ?? null });
  }

  // 4. Si viene session_id (redirect desde Stripe Checkout), verificar y activar
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Verificar que la sesión pertenece a este usuario y está pagada
      const sessionUserId = session.metadata?.user_id;
      const isPaid        = session.payment_status === "paid";

      if (isPaid && sessionUserId === user.id) {
        const customerId = session.customer as string;

        await supabaseAdmin
          .from("profiles")
          .update({ plan: "pro", stripe_customer_id: customerId })
          .eq("id", user.id);

        return NextResponse.json({ plan: "pro", stripe_customer_id: customerId });
      }
    } catch (err) {
      console.warn("Could not retrieve Stripe session:", err);
      // No bloqueamos — devolvemos el plan actual
    }
  }

  return NextResponse.json({ plan: profile.plan, stripe_customer_id: profile.stripe_customer_id ?? null });
}
