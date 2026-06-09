"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { T, PALETTES } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";

interface PostPreviewProps {
  restaurantName: string;
  topic:          string;
  context?:       string;   // now shown in the image as a small badge
  palette:        string;
  format:         "feed" | "story" | "promo";
}

export function PostPreview({ restaurantName, topic, context, palette, format }: PostPreviewProps) {
  const pal                         = PALETTES[palette] ?? PALETTES.terracotta;
  const { plan, handleUpgrade }     = useStudio();
  const previewRef                  = useRef<HTMLDivElement>(null);
  const [saving, setSaving]         = useState(false);
  const [inverted, setInverted]     = useState(false);

  const isStory = format === "story";
  const width   = 340;
  const height  = isStory ? 604 : 340;

  // Colors
  const bg          = inverted ? "#FFFFFF" : pal.primary;
  const textPrimary = inverted ? pal.primary : "#FFFFFF";
  const textSub     = inverted ? T.mist      : "rgba(255,255,255,0.65)";
  const dividerCol  = inverted ? pal.primary  : "rgba(255,255,255,0.4)";
  const accentBg    = inverted ? `${pal.primary}18` : "rgba(255,255,255,0.12)";
  const accentText  = inverted ? pal.primary  : "rgba(255,255,255,0.85)";

  // Trim context to fit nicely in the image
  const contextLabel = context?.trim()
    ? context.length > 44 ? context.slice(0, 44) + "…" : context
    : null;

  const handleDownload = async () => {
    if (!previewRef.current) return;
    if (plan === "free") {
      const res  = await fetch("/api/export/use", { method: "POST" });
      const body = await res.json();
      if (!body.allowed) { handleUpgrade(); return; }
    }
    setSaving(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3, useCORS: true,
        backgroundColor: bg, logging: false,
      });
      const a    = document.createElement("a");
      a.href     = canvas.toDataURL("image/png");
      a.download = `${restaurantName.replace(/\s+/g, "-")}-post.png`;
      a.click();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div>
      {/* Dark / Light toggle */}
      <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
        {[{ label: "Dark", val: false }, { label: "Light", val: true }].map(({ label, val }) => (
          <button
            key={label}
            onClick={() => setInverted(val)}
            style={{
              flex: 1, padding: "6px 0", fontSize: 10,
              fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase",
              border: `1px solid ${inverted === val ? T.terracotta : T.sandDark}`,
              background: inverted === val ? T.terracotta : "transparent",
              color: inverted === val ? "#fff" : T.mist,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Post visual */}
      <div
        ref={previewRef}
        style={{
          width, height, background: bg,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "44px 36px", textAlign: "center",
          position: "relative", overflow: "hidden",
          userSelect: "none",
          border: inverted ? `1px solid ${T.sandDark}` : "none",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", border: `1px solid ${accentBg}`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", border: `1px solid ${accentBg}`, pointerEvents: "none" }} />

        {/* Top ornament */}
        <div style={{ position: "absolute", top: 26, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 1, background: dividerCol, opacity: 0.5 }} />
          <div style={{ width: 4, height: 4, background: dividerCol, transform: "rotate(45deg)" }} />
          <div style={{ width: 28, height: 1, background: dividerCol, opacity: 0.5 }} />
        </div>

        {/* Restaurant name */}
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isStory ? 16 : 13,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: textPrimary, marginBottom: isStory ? 24 : 16,
          opacity: 0.9,
        }}>
          {restaurantName || "Your Restaurant"}
        </p>

        {/* Thin divider */}
        <div style={{ width: 20, height: 1, background: dividerCol, marginBottom: isStory ? 24 : 16 }} />

        {/* Main topic */}
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isStory ? 40 : 28,
          fontWeight: 400, lineHeight: 1.2,
          color: textPrimary, marginBottom: isStory ? 20 : 14,
          maxWidth: 260,
        }}>
          {topic || "Your featured post"}
        </h2>

        {/* Context badge — only shown if user filled it in */}
        {contextLabel && (
          <div style={{
            background: accentBg,
            border: `1px solid ${dividerCol}`,
            padding: "5px 14px", marginBottom: isStory ? 24 : 14,
            fontSize: 10, letterSpacing: "0.1em",
            color: accentText,
            maxWidth: 260,
          }}>
            {contextLabel}
          </div>
        )}

        {/* Bottom divider */}
        <div style={{ width: 28, height: 1, background: dividerCol, marginBottom: isStory ? 24 : 14 }} />

        {/* Format tag */}
        <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: textSub }}>
          {format === "promo" ? "✦ Special Offer" : format === "story" ? "Today's Story" : "From Our Kitchen"}
        </p>

        {/* Brand watermark */}
        <p style={{ position: "absolute", bottom: 16, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: textSub, opacity: 0.5 }}>
          studiobaleares.com
        </p>
      </div>

      {/* Download */}
      <button className="btn-outline" style={{ width, marginTop: 10, fontSize: 10 }} onClick={handleDownload} disabled={saving}>
        {saving ? "Saving…" : "↓ Download Post Image"}
      </button>
      <p style={{ fontSize: 10, color: T.mist, marginTop: 6, textAlign: "center", width }}>
        {width} × {height}px · PNG · 3× resolution
      </p>
    </div>
  );
}
