"use client";

import { T }       from "@/lib/constants";
import { useLang } from "@/contexts/LangContext";

interface Props {
  venueName:      string;
  venueType:      string;
  keywords:       string;
  colorDirection: string;
  onChange:       (field: string, value: string) => void;
  onGenerate:     () => void;
  loading:        boolean;
  error:          string;
}

export function StepBrandInfo({
  venueName, venueType, keywords, colorDirection,
  onChange, onGenerate, loading, error,
}: Props) {
  const { t } = useLang();
  const b = t.branding;

  const canGenerate = venueName.trim() && venueType && keywords.trim() && colorDirection;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>

      {/* Left: form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        <div>
          <label className="field-label">{b.venueName}</label>
          <input
            className="field-input"
            value={venueName}
            onChange={e => onChange("venueName", e.target.value)}
            placeholder={b.venuePh}
          />
        </div>

        <div>
          <label className="field-label">{b.venueType}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {b.venueTypes.map(type => (
              <button
                key={type}
                onClick={() => onChange("venueType", type)}
                style={{
                  padding: "6px 14px", fontSize: 11,
                  border: `1px solid ${venueType === type ? T.terracotta : T.sandDark}`,
                  background: venueType === type ? `${T.terracotta}12` : "transparent",
                  color: venueType === type ? T.terracotta : T.inkLight,
                  cursor: "pointer", letterSpacing: "0.05em",
                  transition: "all 0.15s",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">{b.keywords}</label>
          <input
            className="field-input"
            value={keywords}
            onChange={e => onChange("keywords", e.target.value)}
            placeholder={b.keywordsPh}
          />
          <p style={{ fontSize: 11, color: T.mist, marginTop: 6 }}>{b.keywordsHint}</p>
        </div>

        <div>
          <label className="field-label">{b.colorDir}</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {b.directions.map(({ label, desc, value }) => (
              <button
                key={value}
                onClick={() => onChange("colorDirection", value)}
                style={{
                  padding: "12px 16px",
                  border: `1px solid ${colorDirection === value ? T.terracotta : T.sandDark}`,
                  background: colorDirection === value ? `${T.terracotta}08` : "transparent",
                  cursor: "pointer", textAlign: "left",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 12, color: colorDirection === value ? T.terracotta : T.ink, fontFamily: "inherit" }}>
                  {label}
                </span>
                <span style={{ fontSize: 11, color: T.mist, fontFamily: "inherit" }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ fontSize: 12, color: "#C0392B" }}>{error}</p>}

        <button
          className="btn-primary"
          onClick={onGenerate}
          disabled={!canGenerate || loading}
          style={{ alignSelf: "flex-start", opacity: !canGenerate || loading ? 0.5 : 1 }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="ldot" /><span className="ldot" /><span className="ldot" />
              {b.generatingBtn}
            </span>
          ) : b.generateBtn}
        </button>
      </div>

      {/* Right: live preview hint */}
      <div style={{
        background: T.sand, border: `1px solid ${T.sandDark}`,
        padding: 40, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
      }}>
        <svg width={52} height={52} viewBox="0 0 52 52" style={{ marginBottom: 20 }}>
          <rect
            x={26} y={3} width={32} height={32}
            transform="rotate(45 26 26)"
            fill="none" stroke={T.terracotta} strokeWidth={1.5}
          />
          <text
            x={26} y={30} textAnchor="middle"
            fontSize={16} fontFamily="'Playfair Display', serif"
            fill={T.terracotta}
          >
            {venueName?.[0]?.toUpperCase() ?? "A"}
          </text>
        </svg>

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: T.ink, marginBottom: 8 }}>
          {venueName || "Your Venue"}
        </p>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
          {keywords || "aesthetic · keywords · here"}
        </p>
        <div style={{ width: 32, height: 1, background: T.sandDark, margin: "0 auto 16px" }} />
        <p className="tag" style={{ lineHeight: 1.6 }}>{b.previewHint}</p>
      </div>
    </div>
  );
}
