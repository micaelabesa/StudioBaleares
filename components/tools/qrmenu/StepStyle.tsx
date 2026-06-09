import { T, PALETTES } from "@/lib/constants";
import type { Plan } from "@/lib/types";

interface StepStyleProps {
  palette: string;
  plan: Plan;
  loading: boolean;
  errorMsg: string;
  onSelectPalette: (key: string) => void;
  onUpgrade: () => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function StepStyle({
  palette, plan, loading, errorMsg,
  onSelectPalette, onUpgrade, onBack, onGenerate,
}: StepStyleProps) {
  return (
    <div className="fu">
      <h3 style={{ fontSize: 22, marginBottom: 6 }}>Choose your palette</h3>
      <p style={{ color: T.mist, fontSize: 14, marginBottom: 36 }}>
        Each palette is curated for Mediterranean hospitality aesthetics.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, maxWidth: 520, marginBottom: 52 }}>
        {Object.entries(PALETTES).map(([key, p]) => {
          const locked = plan === "free" && p.proOnly;
          return (
            <div
              key={key}
              onClick={() => locked ? onUpgrade() : onSelectPalette(key)}
              style={{
                padding: "22px 16px", textAlign: "center", cursor: "pointer",
                background: locked ? T.sand : p.bg,
                border: `2px solid ${palette === key ? p.primary : "transparent"}`,
                opacity: locked ? 0.6 : 1,
                transition: "border-color 0.2s, opacity 0.2s",
                position: "relative",
              }}
            >
              <div style={{ width: 28, height: 28, background: p.primary, margin: "0 auto 10px" }} />
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", color: T.ink }}>{p.name}</p>
              {locked && (
                <p style={{ fontSize: 8, color: T.terracotta, marginTop: 4, letterSpacing: "0.1em" }}>PRO</p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onGenerate} disabled={loading}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="ldot" /><span className="ldot" /><span className="ldot" />
              &nbsp;Generating…
            </span>
          ) : "Generate Menu & QR Code ✦"}
        </button>
      </div>

      {errorMsg && <p style={{ marginTop: 14, fontSize: 13, color: T.mist }}>{errorMsg}</p>}
    </div>
  );
}
