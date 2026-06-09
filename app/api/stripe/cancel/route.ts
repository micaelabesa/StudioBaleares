import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan !== "pro") {
    return NextResponse.json({ error: "Not on Pro plan" }, { status: 400 });
  }
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status:   "active",
    limit:    1,
  });

  if (!subscriptions.data.length) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  // Cancel immediately — webhook (customer.subscription.deleted) handles plan → free
  await stripe.subscriptions.cancel(subscriptions.data[0].id);

  return NextResponse.json({ ok: true });
}
