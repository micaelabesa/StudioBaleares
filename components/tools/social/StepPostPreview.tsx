"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { PostPreview } from "./PostPreview";
import type { GeneratedPost } from "@/app/api/generate-social/route";

type Format = "feed" | "story" | "promo";

interface StepPostPreviewProps {
  post:           GeneratedPost;
  restaurantName: string;
  topic:          string;
  context:        string;   // ← now passed through
  palette:        string;
  format:         Format;
  onStartOver:    () => void;
}

type CaptionKey = "short" | "medium" | "long";

const CAPTION_LABELS: Record<CaptionKey, { label: string; desc: string }> = {
  short:  { label: "Short",  desc: "Under 60 chars · punchy"      },
  medium: { label: "Medium", desc: "80-130 chars · with emoji"     },
  long:   { label: "Long",   desc: "160-230 chars · storytelling"  },
};

export function StepPostPreview({ post, restaurantName, topic, context, palette, format, onStartOver }: StepPostPreviewProps) {
  const router                      = useRouter();
  const [copied, setCopied]         = useState<CaptionKey | null>(null);
  const [copiedTags, setCopiedTags] = useState(false);

  const copy = async (key: CaptionKey) => {
    await navigator.clipboard.writeText(post.captions[key]);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyHashtags = async () => {
    await navigator.clipboard.writeText(post.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" "));
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  return (
    <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 52 }}>

      {/* Left: captions + hashtags */}
      <div>
        <h3 style={{ fontSize: 22, marginBottom: 6 }}>Your captions are ready</h3>
        <p style={{ color: T.mist, fontSize: 14, marginBottom: 36 }}>
          Pick the one that fits best — or mix and match.
        </p>

        {/* Caption cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 32 }}>
          {(["short", "medium", "long"] as CaptionKey[]).map((key) => (
            <div key={key} style={{ background: T.white, border: `1px solid ${T.sandDark}`, padding: "24px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.terracotta }}>
                    {CAPTION_LABELS[key].label}
                  </span>
                  <span style={{ fontSize: 10, color: T.mist, marginLeft: 10 }}>{CAPTION_LABELS[key].desc}</span>
                </div>
                <button
                  onClick={() => copy(key)}
                  style={{
                    fontSize: 10, padding: "4px 14px", letterSpacing: "0.1em",
                    border: `1px solid ${copied === key ? T.olive : T.sandDark}`,
                    color: copied === key ? T.olive : T.mist,
                    background: "transparent", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                  }}
                >
                  {copied === key ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <p style={{ fontSize: 14, color: T.ink, lineHeight: 1.7 }}>{post.captions[key]}</p>
            </div>
          ))}
        </div>

        {/* Hashtags */}
        <div style={{ background: T.sand, border: `1px solid ${T.sandDark}`, padding: "22px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p className="tag">Suggested hashtags</p>
            <button
              onClick={copyHashtags}
              style={{
                fontSize: 10, padding: "4px 14px",
                border: `1px solid ${copiedTags ? T.olive : T.sandDark}`,
                color: copiedTags ? T.olive : T.mist,
                background: "transparent", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {copiedTags ? "✓ Copied all" : "Copy all"}
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {post.hashtags.map((tag, i) => (
              <span
                key={i}
                onClick={() => navigator.clipboard.writeText(`#${tag.replace(/^#/, "")}`)}
                style={{
                  fontSize: 12, color: T.terracotta,
                  background: T.white, border: `1px solid ${T.sandDark}`,
                  padding: "4px 10px", cursor: "pointer",
                }}
              >
                #{tag.replace(/^#/, "")}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 16, padding: "16px 20px", background: T.cream, border: `1px solid ${T.sandDark}` }}>
          <p className="tag" style={{ marginBottom: 6 }}>Call to action</p>
          <p style={{ fontSize: 13, color: T.inkLight }}>{post.cta}</p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
          <button className="btn-ghost" onClick={onStartOver}>← New post</button>
          <button className="btn-outline" onClick={() => router.push("/studio/qrmenu")}>QR Menu Generator →</button>
        </div>
      </div>

      {/* Right: visual preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p className="tag" style={{ marginBottom: 4 }}>Post preview</p>
        <PostPreview
          restaurantName={restaurantName}
          topic={topic}
          context={context}
          palette={palette}
          format={format}
        />
      </div>

    </div>
  );
}
