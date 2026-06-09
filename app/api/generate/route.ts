import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { MenuCategory, GeneratedMenu } from "@/lib/types";

// Service-role client for writes — bypasses RLS, only safe on the server
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { info, categories, palette } = await req.json() as {
    info:       { name: string; tagline: string; cuisine: string };
    categories: MenuCategory[];
    palette:    string;
  };

  // ── 1. Get current user from session (if logged in) ─────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── 2. Call Claude (API key stays on the server) ────────────────────────────
  let menu: GeneratedMenu;

  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a Mediterranean hospitality copywriter. Enhance these menu descriptions to sound beautiful and appetising. Return ONLY valid JSON — no markdown fences, no explanation.

Restaurant: ${info.name}
Tagline: ${info.tagline}
Cuisine: ${info.cuisine}
Menu: ${JSON.stringify(categories)}

Return exactly this shape:
{"restaurantName":"${info.name}","tagline":"poetic tagline max 8 words","categories":[{"category":"name","items":[{"name":"...","desc":"one elegant sentence","price":"..."}]}]}`,
        }],
      }),
    });

    const claudeData = await claudeRes.json();
    const raw        = (claudeData.content?.[0]?.text as string) ?? "";
    const clean      = raw.replace(/```json|```/g, "").trim();
    menu             = JSON.parse(clean) as GeneratedMenu;

  } catch {
    menu = {
      restaurantName: info.name,
      tagline:        info.tagline || "Flavors kissed by the Mediterranean sun",
      categories,
    };
  }

  // ── 3. Save to Supabase with user_id if authenticated ───────────────────────
  const { data: row, error } = await supabaseAdmin
    .from("menus")
    .insert({
      data:    menu,
      palette,
      user_id: user?.id ?? null,   // null for anonymous — linked in Phase 4 auth
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error.message);
    return NextResponse.json({ menu, id: null, error: "Could not save menu" });
  }

  return NextResponse.json({ menu, id: row.id });
}
