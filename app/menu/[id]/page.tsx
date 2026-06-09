import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PALETTES, T } from "@/lib/constants";
import { MenuPreview } from "@/components/tools/shared/MenuPreview";
import type { GeneratedMenu } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>; // Next.js 15+ — params is a Promise
}

// Dynamic metadata — so the page title matches the restaurant name
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }   = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("menus")
    .select("data")
    .eq("id", id)
    .single();

  const menu = data?.data as GeneratedMenu | undefined;
  return {
    title: menu ? `${menu.restaurantName} — Menu` : "Menu",
    description: menu?.tagline ?? "Scan to view the menu",
  };
}

export default async function PublicMenuPage({ params }: Props) {
  const { id }   = await params;
  const supabase = await createClient();

  // Fetch menu row
  const { data: row, error } = await supabase
    .from("menus")
    .select("id, data, palette, views")
    .eq("id", id)
    .single();

  if (error || !row) notFound();

  const menu    = row.data as GeneratedMenu;
  const palette = PALETTES[row.palette as string] ?? PALETTES.terracotta;

  // Increment view counter (fire-and-forget — don't block render)
  supabase
    .from("menus")
    .update({ views: (row.views ?? 0) + 1 })
    .eq("id", row.id)
    .then(() => {}); // intentionally not awaited

  return (
    <div style={{ minHeight: "100vh", background: palette.bg }}>
      {/* Minimal top bar — no full Nav so guests stay focused on the menu */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 32px",
        borderBottom: `1px solid ${T.sandDark}`,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 13, color: T.ink, letterSpacing: "0.04em",
        }}>
          {menu.restaurantName}
        </span>
        <Link href="/studio/qrmenu" style={{ textDecoration: "none" }}>
          <span style={{
            fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
            color: T.mist, borderBottom: `1px solid ${T.sandDark}`, paddingBottom: 2,
          }}>
            Make your own →
          </span>
        </Link>
      </div>

      {/* Menu */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "52px 24px 80px" }}>
        <MenuPreview
          menu={menu}
          primaryColor={palette.primary}
          bgColor={palette.bg}
          watermark={false} // public page never shows watermark
        />

        {/* Footer CTA */}
        <div style={{
          textAlign: "center", marginTop: 52,
          paddingTop: 32, borderTop: `1px solid ${T.sandDark}`,
        }}>
          <p style={{ fontSize: 12, color: T.mist, marginBottom: 14, letterSpacing: "0.06em" }}>
            Menu created with
          </p>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 16, color: T.ink,
            }}>
              Studio Baleares
            </span>
          </Link>
          <p style={{ marginTop: 10, fontSize: 12, color: T.mist }}>
            Create your own beautiful digital menu — free
          </p>
          <Link href="/studio/qrmenu">
            <button className="btn-outline" style={{ marginTop: 16, fontSize: 10 }}>
              Try it free →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
