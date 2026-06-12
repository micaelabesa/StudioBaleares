import { NextResponse } from "next/server";
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

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Cancel active Stripe subscription if on Pro
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "pro" && profile?.stripe_customer_id) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status:   "active",
        limit:    1,
      });
      if (subscriptions.data.length) {
        await stripe.subscriptions.cancel(subscriptions.data[0].id);
      }
    } catch (err) {
      console.warn("Could not cancel Stripe subscription during account deletion:", err);
      // Non-fatal — proceed with deletion
    }
  }

  // Delete user (cascades profile via DB foreign key)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("deleteUser error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
