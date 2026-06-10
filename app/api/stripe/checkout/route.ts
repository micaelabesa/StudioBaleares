import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  // ── 1. Verificar que el usuario está autenticado ──────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ── 2. Buscar si ya tiene un stripe_customer_id ───────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, plan")
    .eq("id", user.id)
    .single();

  // Si ya es Pro, no crear nueva sesión
  if (profile?.plan === "pro") {
    return NextResponse.json({ error: "Already Pro" }, { status: 400 });
  }

  // ── 3. Crear o reutilizar cliente en Stripe ───────────────────────────────
  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
  }

  // ── 4. Crear la sesión de Checkout ────────────────────────────────────────
  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer:             customerId,
    payment_method_types: ["card"],
    line_items: [{
      price:    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!,
      quantity: 1,
    }],
    mode:         "subscription",
    success_url:  `${origin}/studio/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:   `${origin}/`,
    metadata: {
      user_id: user.id,   // el webhook lo usa para actualizar el plan
    },
  });

  return NextResponse.json({ url: session.url });
}
