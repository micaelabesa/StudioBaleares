import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Unauthenticated users: can't track them, let through
  if (!user) return NextResponse.json({ allowed: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, last_export_date")
    .eq("id", user.id)
    .single();

  // Pro: unlimited
  if (profile?.plan === "pro") return NextResponse.json({ allowed: true });

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  if (profile?.last_export_date === today) {
    return NextResponse.json({ allowed: false });
  }

  // Record today's export — fail open if DB write fails
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ last_export_date: today })
    .eq("id", user.id);

  if (error) console.error("Failed to record export date:", error.message);

  return NextResponse.json({ allowed: true });
}
