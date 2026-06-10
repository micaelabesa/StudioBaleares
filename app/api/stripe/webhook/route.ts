// app/api/stripe/webhook/route.ts
//
// Sin cambios en la lógica — el webhook estaba correcto.
// Añadida la línea para guardar stripe_customer_id en el checkout también,
// así el fallback por customer_id siempre funciona.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// Client con service role — puede hacer UPDATE sin RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err);
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  console.log(`📨 Webhook received: ${event.type}`);

  switch (event.type) {

    case "checkout.session.completed": {
      const session    = event.data.object as Stripe.Checkout.Session;
      const userId     = session.metadata?.user_id;
      const customerId = session.customer as string;

      console.log("✅ checkout.session.completed");
      console.log("   user_id  :", userId     ?? "❌ MISSING");
      console.log("   customer :", customerId ?? "❌ MISSING");

      if (userId) {
        // Camino principal — user_id viene en metadata
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            plan:               "pro",
            stripe_customer_id: customerId,  // guardar siempre para el fallback
          })
          .eq("id", userId);

        if (error) {
          console.error("❌ Supabase update failed:", error.message);
        } else {
          console.log("✅ profiles.plan = pro  →  user:", userId);
        }
      } else {
        // Fallback — buscar por stripe_customer_id
        console.warn("⚠️  No user_id in metadata. Trying customer lookup…");

        const { data: profile, error } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile && !error) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan: "pro" })
            .eq("id", profile.id);
          console.log("✅ Profile updated via customer_id:", profile.id);
        } else {
          console.error("❌ Could not resolve user for customer:", customerId);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub        = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      console.log("🔄 Subscription cancelled:", customerId);

      await supabaseAdmin
        .from("profiles")
        .update({ plan: "free" })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice    = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      console.warn("⚠️  Payment failed for customer:", customerId);
      // Opcional: enviar email de aviso, no cambiar plan todavía
      break;
    }

    default:
      console.log(`   (unhandled: ${event.type})`);
  }

  return NextResponse.json({ received: true });
}
