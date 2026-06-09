import { T, PALETTES } from "@/lib/constants";
import { ProBadge } from "@/components/ui/ProBadge";
import type { Plan } from "@/lib/types";

type Format = "feed" | "story" | "promo";
type Tone   = "elegant" | "warm" | "minimal";

interface StepPostTypeProps {
  format:         Format;
  tone:           Tone;
  palette:        string;
  plan:           Plan;
  loading:        boolean;
  errorMsg:       string;
  onSetFormat:    (f: Format) => void;
  onSetTone:      (t: Tone) => void;
  onSetPalette:   (p: string) => void;
  onUpgrade:      () => void;
  onBack:         () => void;
  onGenerate:     () => void;
}

const FORMATS: { key: Format; label: string; desc: string }[] = [
  { key: "feed",  label: "Feed Post",    desc: "Square 1:1 — classic Instagram" },
  { key: "story", label: "Story",        desc: "Vertical 9:16 — full screen"   },
  { key: "promo", label: "Promotion",    desc: "Square with offer badge"        },
];

const TONES: { key: Tone; label: string; desc: string }[] = [
  { key: "elegant", label: "Elegant",   desc: "Poetic, refined, evocative"  },
  { key: "warm",    label: "Warm",      desc: "Friendly, inviting, personal" },
  { key: "minimal", label: "Minimal",   desc: "Clean, bold, direct"         },
];

export function StepPostType({
  format, tone, palette, plan, loading, errorMsg,
  onSetFormat, onSetTone, onSetPalette, onUpgrade, onBack, onGenerate,
}: StepPostTypeProps) {
  return (
    <div className="fu">
      <h3 style={{ fontSize: 22, marginBottom: 6 }}>Choose your style</h3>
      <p style={{ color: T.mist, fontSize: 14, marginBottom: 40 }}>
        Format, tone and palette — the AI adapts the captions to match.
      </p>

      {/* Format */}
      <div style={{ marginBottom: 36 }}>
        <p className="field-label" style={{ marginBottom: 14 }}>Post format</p>
        <div style={{ display: "flex", gap: 2 }}>
          {FORMATS.map((f) => (
            <div
              key={f.key}
              onClick={() => onSetFormat(f.key)}
              style={{
                flex: 1, padding: "20px 18px", cursor: "pointer",
                border: `2px solid ${format === f.key ? T.terracotta : T.sandDark}`,
                background: format === f.key ? "#FDF4EF" : T.white,
                transition: "all 0.15s",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 4 }}>{f.label}</p>
              <p style={{ fontSize: 11, color: T.mist }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div style={{ marginBottom: 36 }}>
        <p className="field-label" style={{ marginBottom: 14 }}>Caption tone</p>
        <div style={{ display: "flex", gap: 2 }}>
          {TONES.map((tn) => (
            <div
              key={tn.key}
              onClick={() => onSetTone(tn.key)}
              style={{
                flex: 1, padding: "20px 18px", cursor: "pointer",
                border: `2px solid ${tone === tn.key ? T.terracotta : T.sandDark}`,
                background: tone === tn.key ? "#FDF4EF" : T.white,
                transition: "all 0.15s",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 4 }}>{tn.label}</p>
              <p style={{ fontSize: 11, color: T.mist }}>{tn.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Palette */}
      <div style={{ marginBottom: 44 }}>
        <p className="field-label" style={{ marginBottom: 14 }}>Post palette</p>
        <div style={{ display: "flex", gap: 2 }}>
          {Object.entries(PALETTES).map(([key, p]) => {
            const locked = plan === "free" && p.proOnly;
            return (
              <div
                key={key}
                onClick={() => locked ? onUpgrade() : onSetPalette(key)}
                style={{
                  flex: 1, padding: "18px 14px", textAlign: "center", cursor: "pointer",
                  border: `2px solid ${palette === key ? p.primary : "transparent"}`,
                  background: locked ? T.sand : p.bg,
                  opacity: locked ? 0.6 : 1,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ width: 24, height: 24, background: p.primary, margin: "0 auto 8px" }} />
                <p style={{ fontSize: 10, fontWeight: 500, color: T.ink }}>{p.name}</p>
                {locked && <ProBadge />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onGenerate} disabled={loading}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="ldot" /><span className="ldot" /><span className="ldot" />
              &nbsp;Writing captions…
            </span>
          ) : "Generate Post ✦"}
        </button>
      </div>

      {errorMsg && <p style={{ marginTop: 14, fontSize: 13, color: T.mist }}>{errorMsg}</p>}
    </div>
  );
}
