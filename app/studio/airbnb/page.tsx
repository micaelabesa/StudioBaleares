"use client";

// app/studio/airbnb/page.tsx
// v4 — fixes:
//   1. document.fonts.ready antes de html2canvas → texto sin espacios resuelto
//   2. PdfPreview con width/height A4 fijos + overflow:hidden → una sola página
//   3. House rules en 2 col si >3, recommendations en 2 col si >2
//   4. Watermark diagonal para plan free (capturado por html2canvas)
//   5. Export: addImage(0,0,210,297) sin bucle → siempre 1 página
//   6. handleUpgrade (no onUpgrade)
//   7. sessionStorage para persistir entre redirects

import {
  useState, useCallback, useEffect, useRef,
  type ChangeEvent,
} from "react";
import { T } from "@/lib/constants";
import { Ornament } from "@/components/ui/Ornament";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { useStudio } from "@/contexts/StudioContext";

import type {
  WelcomeGuideData, PropertyInfo, ContentData, StyleData,
  HouseRule, LocalRec, EmergencyContact, PropertyType, PdfPalette, DocLanguage,
} from "@/types/airbnb";
import { TR } from "@/lib/airbnb-translations";
import { useLang } from "@/contexts/LangContext";

// ─── PALETTES ─────────────────────────────────────────────────────────────────
const PALETTES: Record<PdfPalette, { primary: string; bg: string; accent: string; name: string }> = {
  terracotta: { primary: "#C4693A", bg: "#FAF7F2", accent: "#8B4520", name: "Warm Terracotta" },
  sea:        { primary: "#2C5F6E", bg: "#F0F5F7", accent: "#1A3F4A", name: "Ocean Blue" },
  noir:       { primary: "#1A1A18", bg: "#FDFCF9", accent: "#3D3D3A", name: "Minimalist Black" },
};

// A4 a 96 dpi: 210mm × 297mm → 794px × 1123px
const A4_W = 794;
const A4_H = 1123;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }

const PROPERTY_TYPES: PropertyType[] = ["Airbnb", "Villa", "B&B", "Hotel boutique", "Apartamento"];
const SS_KEY = "airbnb_guide_draft";

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEFAULT_INFO: PropertyInfo = {
  propertyName: "", hostName: "", propertyType: "Airbnb",
  city: "", checkIn: "15:00", checkOut: "11:00",
  wifiName: "", wifiPassword: "",
};
const DEFAULT_CONTENT: ContentData = {
  welcomeNote: "",
  rules: [
    { id: uid(), text: "No smoking indoors" },
    { id: uid(), text: "Respect quiet hours after 22:00" },
    { id: uid(), text: "No parties or events" },
  ],
  recommendations: [{ id: uid(), name: "", type: "Restaurant", description: "" }],
  emergency: [
    { id: uid(), label: "General Emergencies", value: "112" },
    { id: uid(), label: "Host", value: "" },
  ],
};
const DEFAULT_STYLE: StyleData = { palette: "terracotta", language: "en" };

// ─── sessionStorage ───────────────────────────────────────────────────────────
function loadDraft(): { step: 1|2|3; info: PropertyInfo; content: ContentData; style: StyleData } | null {
  try { const r = sessionStorage.getItem(SS_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveDraft(step: 1|2|3, info: PropertyInfo, content: ContentData, style: StyleData) {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify({ step, info, content, style })); } catch {}
}
function clearDraft() { try { sessionStorage.removeItem(SS_KEY); } catch {} }

// ─── Font loader — CRÍTICO para html2canvas ───────────────────────────────────
// html2canvas captura el DOM como bitmap. Si las Google Fonts no están cargadas
// en el momento de la captura, usa la fuente de fallback del sistema y el texto
// aparece sin kerning ("Nosmokingindoors" en vez de "No smoking indoors").
async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 300)); // margen extra por latencia de red
  } catch { /* navegadores sin FontFaceSet — continuar */ }
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 1
// ═════════════════════════════════════════════════════════════════════════════
function Step1({ info, setInfo, onNext }: {
  info: PropertyInfo; setInfo: (i: PropertyInfo) => void; onNext: () => void;
}) {
  const set = (field: keyof PropertyInfo) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setInfo({ ...info, [field]: e.target.value });
  const valid = info.propertyName.trim() && info.hostName.trim() && info.city.trim();

  return (
    <div className="fu">
      <h3 style={{ fontSize: 22, marginBottom: 6 }}>Property &amp; Basic Details</h3>
      <p style={{ color: T.mist, fontSize: 14, marginBottom: 36 }}>
        This information will appear throughout the welcome guide.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px" }}>
        <div>
          <label className="field-label">Property Name *</label>
          <input className="field-input" placeholder="e.g. Villa Marina"
            value={info.propertyName} onChange={set("propertyName")} />
        </div>
        <div>
          <label className="field-label">Host Name *</label>
          <input className="field-input" placeholder="e.g. Carlos Mendoza"
            value={info.hostName} onChange={set("hostName")} />
        </div>
        <div>
          <label className="field-label">Property Type</label>
          <select className="field-input" value={info.propertyType} onChange={set("propertyType")} style={{ cursor: "pointer" }}>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">City *</label>
          <input className="field-input" placeholder="e.g. Málaga" value={info.city} onChange={set("city")} />
        </div>
        <div>
          <label className="field-label">Check-in / Check-out</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input className="field-input" placeholder="15:00" value={info.checkIn} onChange={set("checkIn")} />
            <input className="field-input" placeholder="11:00" value={info.checkOut} onChange={set("checkOut")} />
          </div>
        </div>
        <div>
          <label className="field-label">Wi-Fi Network &amp; Password</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input className="field-input" placeholder="Network name" value={info.wifiName} onChange={set("wifiName")} />
            <input className="field-input" placeholder="Password" value={info.wifiPassword} onChange={set("wifiPassword")} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 48 }}>
        <button className="btn-primary" disabled={!valid} onClick={onNext}>Next Step →</button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 2
// ═════════════════════════════════════════════════════════════════════════════
function Step2({ content, setContent, onBack, onNext, loading }: {
  content: ContentData; setContent: (c: ContentData) => void;
  onBack: () => void; onNext: () => void; loading: boolean;
}) {
  const addRule        = () => setContent({ ...content, rules: [...content.rules, { id: uid(), text: "" }] });
  const updateRule     = (id: string, text: string) =>
    setContent({ ...content, rules: content.rules.map(r => r.id === id ? { ...r, text } : r) });
  const removeRule     = (id: string) =>
    setContent({ ...content, rules: content.rules.filter(r => r.id !== id) });

  const addRec         = () => setContent({ ...content, recommendations: [...content.recommendations, { id: uid(), name: "", type: "Restaurant", description: "" }] });
  const updateRec      = (id: string, field: keyof LocalRec, val: string) =>
    setContent({ ...content, recommendations: content.recommendations.map(r => r.id === id ? { ...r, [field]: val } : r) });
  const removeRec      = (id: string) =>
    setContent({ ...content, recommendations: content.recommendations.filter(r => r.id !== id) });

  const addEmergency    = () => setContent({ ...content, emergency: [...content.emergency, { id: uid(), label: "", value: "" }] });
  const updateEmergency = (id: string, field: keyof EmergencyContact, val: string) =>
    setContent({ ...content, emergency: content.emergency.map(e => e.id === id ? { ...e, [field]: val } : e) });
  const removeEmergency = (id: string) =>
    setContent({ ...content, emergency: content.emergency.filter(e => e.id !== id) });

  const sectionTitle = (label: string, onAdd: () => void, addLabel: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 3, height: 20, background: T.terracotta }} />
        <h4 style={{ fontSize: 15, fontWeight: 400 }}>{label}</h4>
      </div>
      <button className="btn-ghost" style={{ fontSize: 10, padding: "4px 14px" }} onClick={onAdd}>+ {addLabel}</button>
    </div>
  );

  return (
    <div className="fu">
      <h3 style={{ fontSize: 22, marginBottom: 6 }}>Content</h3>
      <p style={{ color: T.mist, fontSize: 14, marginBottom: 36 }}>
        Enter your content in plain language — the AI will rewrite it in a warm, elegant tone.
      </p>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 3, height: 20, background: T.terracotta }} />
          <h4 style={{ fontSize: 15, fontWeight: 400 }}>Welcome Note</h4>
        </div>
        <textarea className="field-input"
          placeholder="Write a short welcome message, or leave empty and the AI will write one for you."
          value={content.welcomeNote}
          onChange={e => setContent({ ...content, welcomeNote: e.target.value })}
          style={{ minHeight: 90, resize: "vertical" }} />
      </div>

      <div style={{ marginBottom: 40 }}>
        {sectionTitle("House Rules", addRule, "Rule")}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {content.rules.map(rule => (
            <div key={rule.id} style={{ display: "grid", gridTemplateColumns: "1fr 32px", gap: 10, alignItems: "center" }}>
              <input className="field-input" placeholder="e.g. No smoking indoors"
                value={rule.text} onChange={e => updateRule(rule.id, e.target.value)} />
              <button onClick={() => removeRule(rule.id)}
                style={{ color: T.mist, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        {sectionTitle("Local Recommendations", addRec, "Place")}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {content.recommendations.map(rec => (
            <div key={rec.id} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 32px",
              gap: 10, padding: 16, background: T.white, border: `1px solid ${T.sandDark}`,
            }}>
              <input className="field-input"
                style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.sandDark}`, padding: "6px 0" }}
                placeholder="Place name" value={rec.name}
                onChange={e => updateRec(rec.id, "name", e.target.value)} />
              <input className="field-input"
                style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.sandDark}`, padding: "6px 0" }}
                placeholder="Type (Restaurant, Beach…)" value={rec.type}
                onChange={e => updateRec(rec.id, "type", e.target.value)} />
              <button onClick={() => removeRec(rec.id)}
                style={{ color: T.mist, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              <div style={{ gridColumn: "1 / -1" }}>
                <input className="field-input"
                  style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.sandDark}`, padding: "6px 0" }}
                  placeholder="Short description (AI will enhance this)"
                  value={rec.description} onChange={e => updateRec(rec.id, "description", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        {sectionTitle("Emergency Contacts", addEmergency, "Contact")}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {content.emergency.map(em => (
            <div key={em.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px", gap: 10 }}>
              <input className="field-input" placeholder="Label (e.g. Host, Hospital…)"
                value={em.label} onChange={e => updateEmergency(em.id, "label", e.target.value)} />
              <input className="field-input" placeholder="Phone / address"
                value={em.value} onChange={e => updateEmergency(em.id, "value", e.target.value)} />
              <button onClick={() => removeEmergency(em.id)}
                style={{ color: T.mist, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48 }}>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext} disabled={loading}>
          {loading
            ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="ldot" /><span className="ldot" /><span className="ldot" />
                &nbsp;AI is writing…
              </span>
            : "Generate Preview ✦"}
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PDF PREVIEW — dimensiones A4 fijas, 2 columnas, watermark
// ═════════════════════════════════════════════════════════════════════════════
function PdfPreview({ data, wifiQrUrl, previewRef, isFree }: {
  data: WelcomeGuideData;
  wifiQrUrl: string | null;
  previewRef: React.RefObject<HTMLDivElement | null>;
  isFree: boolean;
}) {
  const { info, content, style } = data;
  const pal  = PALETTES[style.palette];
  const tr   = TR[style.language];

  const activeRules = content.rules.filter(r => r.text);
  const activeRecs  = content.recommendations.filter(r => r.name);
  const activeEmerg = content.emergency.filter(e => e.label || e.value);

  const rulesTwoCols = activeRules.length > 3;
  const recsTwoCols  = activeRecs.length  > 2;

  const sectionHead = (label: string) => (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: pal.primary }}>
        {label}
      </p>
      <div style={{ height: 1, background: pal.primary, opacity: 0.2, marginTop: 5 }} />
    </div>
  );

  return (
    // Wrapper: tamaño fijo A4, html2canvas captura este div exacto
    <div
      ref={previewRef}
      style={{
        width:      A4_W,
        height:     A4_H,
        minWidth:   A4_W,
        overflow:   "hidden",       // nada sobresale del A4
        background: pal.bg,
        padding:    "44px 52px 36px",
        fontFamily: "'Lora', serif",
        color:      "#1A1A18",
        position:   "relative",
        boxSizing:  "border-box",
      }}
    >
      {/* ── Watermark diagonal (plan free) ── */}
      {isFree && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none", zIndex: 10, overflow: "hidden",
        }}>
          <div style={{
            transform: "rotate(-35deg)",
            display: "flex", flexDirection: "column", gap: 56,
            opacity: 0.06, whiteSpace: "nowrap", userSelect: "none",
          }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <p key={i} style={{
                fontSize: 28, fontWeight: 700, letterSpacing: "0.14em",
                color: pal.primary,
                fontFamily: "'Playfair Display', serif",
                marginLeft: i % 2 === 0 ? 0 : 100,
              }}>
                STUDIO BALEARES · STUDIO BALEARES ·
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${pal.primary}25` }}>
        <p style={{ fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: pal.primary, marginBottom: 10 }}>
          ✦ &nbsp; {(info.propertyName || "VILLA MARINA").toUpperCase()} &nbsp; ✦
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 400, color: "#1A1A18", marginBottom: 8 }}>
          {tr.welcome}
        </h1>
        <p style={{ fontSize: 12, color: "#5A5A55", fontStyle: "italic", lineHeight: 1.65, maxWidth: 460, margin: "0 auto" }}>
          {content.welcomeNote || `${tr.dearGuest} We are thrilled to have you here at ${info.propertyName || "our home"}.`}
        </p>
      </div>

      {/* ── Info strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: `${pal.primary}20`, marginBottom: 24 }}>
        {[
          { label: tr.checkIn,  value: info.checkIn  || "15:00" },
          { label: tr.checkOut, value: info.checkOut || "11:00" },
          { label: "📍",        value: info.city     || "—"     },
        ].map((item, i) => (
          <div key={i} style={{ background: pal.bg, padding: "10px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: pal.primary, marginBottom: 3 }}>
              {item.label}
            </p>
            <p style={{ fontSize: 14, fontFamily: "'Playfair Display', serif" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* ── Body: 2 columnas ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 36px" }}>

        {/* Columna izquierda: WiFi + Rules + Emergency */}
        <div>
          {/* Wi-Fi */}
          {(info.wifiName || info.wifiPassword) && (
            <div style={{ marginBottom: 18 }}>
              {sectionHead(`📶 ${tr.wifi}`)}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <p style={{ fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: pal.primary, fontWeight: 600 }}>{tr.network}:</span>
                    &nbsp;{info.wifiName || "—"}
                  </p>
                  <p style={{ fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: pal.primary, fontWeight: 600 }}>{tr.password}:</span>
                    &nbsp;{info.wifiPassword || "—"}
                  </p>
                  <p style={{ fontSize: 9, color: "#9B9B95", fontStyle: "italic" }}>{tr.caseSensitive}</p>
                </div>
                {wifiQrUrl && (
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <img src={wifiQrUrl} alt="Wi-Fi QR"
                      style={{ width: 58, height: 58, display: "block", marginBottom: 4 }} />
                    <p style={{ fontSize: 7, color: "#9B9B95", letterSpacing: "0.06em" }}>{tr.scanWifi}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* House Rules */}
          {activeRules.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {sectionHead(`🏡 ${tr.houseRules}`)}
              <div style={{
                display: "grid",
                gridTemplateColumns: rulesTwoCols ? "1fr 1fr" : "1fr",
                gap: "3px 12px",
              }}>
                {activeRules.map(rule => (
                  <div key={rule.id} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <span style={{ color: pal.primary, flexShrink: 0, fontSize: 10, marginTop: 2 }}>•</span>
                    <p style={{ fontSize: 11, lineHeight: 1.5, color: "#3D3D3A" }}>{rule.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency */}
          {activeEmerg.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {sectionHead(`🚨 ${tr.emergency}`)}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {activeEmerg.map(em => (
                  <div key={em.id} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <p style={{ fontSize: 11, color: pal.primary, fontWeight: 600, minWidth: 100, flexShrink: 0 }}>{em.label}</p>
                    <p style={{ fontSize: 11, color: "#3D3D3A" }}>{em.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Recommendations */}
        <div>
          {activeRecs.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {sectionHead(`🍽️ ${tr.recommendations}`)}
              <div style={{
                display: "grid",
                gridTemplateColumns: recsTwoCols ? "1fr 1fr" : "1fr",
                gap: recsTwoCols ? "10px 14px" : "10px",
              }}>
                {activeRecs.map(rec => (
                  <div key={rec.id}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18" }}>{rec.name}</p>
                      <p style={{ fontSize: 8, color: pal.primary, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {rec.type}
                      </p>
                    </div>
                    {rec.description && (
                      <p style={{ fontSize: 11, color: "#5A5A55", fontStyle: "italic", lineHeight: 1.5 }}>
                        {rec.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        position: "absolute", bottom: 24, left: 52, right: 52,
        borderTop: `1px solid ${pal.primary}18`,
        paddingTop: 14,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <p style={{ fontSize: 10, color: "#9B9B95", fontStyle: "italic" }}>{tr.footerNote}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {isFree && (
            <p style={{ fontSize: 8, color: pal.primary, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.45 }}>
              studiobaleares.com
            </p>
          )}
          {info.hostName && (
            <p style={{ fontSize: 9, color: pal.primary, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {tr.managedBy} {info.hostName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 3 — Style + Live Preview
// ═════════════════════════════════════════════════════════════════════════════
function Step3({ data, setStyle, wifiQrUrl, previewRef, onBack, onExport, exporting }: {
  data: WelcomeGuideData;
  setStyle: (s: StyleData) => void;
  wifiQrUrl: string | null;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onExport: () => void;
  exporting: boolean;
}) {
  const { style } = data;
  const { plan, handleUpgrade } = useStudio();

  return (
    <div className="fu" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48, alignItems: "start" }}>

      {/* Left: controls */}
      <div style={{ position: "sticky", top: 96 }}>
        <h3 style={{ fontSize: 20, marginBottom: 6 }}>Style</h3>
        <p style={{ color: T.mist, fontSize: 13, marginBottom: 32 }}>Changes apply in real time.</p>

        {/* Palette */}
        <div style={{ marginBottom: 32 }}>
          <label className="field-label" style={{ marginBottom: 14 }}>Colour Palette</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(Object.entries(PALETTES) as [PdfPalette, typeof PALETTES.terracotta][]).map(([key, p]) => {
              const locked = plan === "free" && key !== "terracotta";
              return (
                <div key={key}
                  onClick={() => locked ? handleUpgrade() : setStyle({ ...style, palette: key })}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    border: `1.5px solid ${style.palette === key ? p.primary : T.sandDark}`,
                    background: style.palette === key ? `${p.primary}08` : T.white,
                    cursor: locked ? "default" : "pointer",
                    opacity: locked ? 0.55 : 1, transition: "all 0.2s",
                  }}>
                  <div style={{ width: 20, height: 20, background: p.primary, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: T.ink }}>{p.name}</span>
                  {locked && (
                    <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, color: T.terracotta, letterSpacing: "0.1em" }}>
                      PRO
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Language */}
        <div style={{ marginBottom: 40 }}>
          <label className="field-label" style={{ marginBottom: 14 }}>Document Language</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(["en", "es"] as DocLanguage[]).map(lang => (
              <button key={lang} onClick={() => setStyle({ ...style, language: lang })} style={{
                padding: "10px 0",
                border: `1.5px solid ${style.language === lang ? PALETTES[style.palette].primary : T.sandDark}`,
                background: style.language === lang ? `${PALETTES[style.palette].primary}08` : T.white,
                color: T.ink, fontSize: 13, fontWeight: 500,
                letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.2s",
              }}>
                {lang === "en" ? "🇬🇧 EN" : "🇪🇸 ES"}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-primary" onClick={onExport} disabled={exporting}>
            {exporting
              ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="ldot" /><span className="ldot" /><span className="ldot" />
                  &nbsp;Generating PDF…
                </span>
              : "↓ Download PDF"}
          </button>
          <button className="btn-ghost" onClick={onBack} style={{ fontSize: 10 }}>← Back</button>
        </div>

        {plan === "free" && (
          <div style={{ marginTop: 24, padding: "16px", background: T.sand, border: `1px solid ${T.sandDark}` }}>
            <p className="tag" style={{ marginBottom: 6 }}>✦ Pro</p>
            <p style={{ fontSize: 12, color: T.mist, marginBottom: 12 }}>
              Remove watermark and unlock all colour palettes.
            </p>
            <button className="btn-outline" style={{ width: "100%", fontSize: 10 }} onClick={handleUpgrade}>
              Upgrade →
            </button>
          </div>
        )}
      </div>

      {/* Right: live preview — escalado para caber en pantalla */}
      <div style={{ border: `1px solid ${T.sandDark}`, overflow: "hidden" }}>
        <div style={{
          padding: "8px 16px", background: T.ink, color: T.white,
          fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span className="live-dot" />
          Live Preview · {data.info.propertyName || "Your Property"}
          {plan === "free" && (
            <span style={{ marginLeft: "auto", fontSize: 9, color: "#6BFFB8", opacity: 0.7, letterSpacing: "0.08em" }}>
              WATERMARK ACTIVE
            </span>
          )}
        </div>
        {/*
          El div A4 mide 794px. Lo escalamos al 72% para que quepa en el panel
          pero el div real que captura html2canvas sigue siendo 794×1123.
        */}
        <div style={{ overflow: "auto" }}>
          <div style={{
            transformOrigin: "top left",
            transform: "scale(0.72)",
            width: A4_W,
            height: A4_H,
          }}>
            <PdfPreview
              data={data}
              wifiQrUrl={wifiQrUrl}
              previewRef={previewRef}
              isFree={plan === "free"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP INDICATOR
// ═════════════════════════════════════════════════════════════════════════════
function StepIndicator({ step, primary }: { step: number; primary: string }) {
  const { t } = useLang();
  const steps = t.airbnb.steps;
  return (
    <div style={{ display: "flex", maxWidth: 540, marginBottom: 52 }}>
      {steps.map((label, i) => {
        const n = i + 1, done = n < step, current = n === step;
        return (
          <div key={i} style={{ flex: 1, position: "relative" }}>
            {i < steps.length - 1 && (
              <div className="step-conn" style={{ background: done ? primary : T.sandDark }} />
            )}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: i === 0 ? "flex-start" : i === steps.length - 1 ? "flex-end" : "center",
            }}>
              <div style={{
                width: 24, height: 24, marginBottom: 7,
                border: `1.5px solid ${done || current ? primary : T.sandDark}`,
                background: done ? primary : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 500,
                color: done ? "var(--white)" : current ? primary : T.mist,
              }}>
                {done ? "✓" : n}
              </div>
              <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: current ? primary : T.mist }}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function AirbnbPage() {
  const { plan, handleUpgrade } = useStudio();
  const { t } = useLang();

  const draft = typeof window !== "undefined" ? loadDraft() : null;

  const [step,      setStep]      = useState<1|2|3>(draft?.step    ?? 1);
  const [info,      setInfo]      = useState<PropertyInfo>(draft?.info    ?? DEFAULT_INFO);
  const [content,   setContent]   = useState<ContentData>(draft?.content ?? DEFAULT_CONTENT);
  const [style,     setStyleData] = useState<StyleData>(draft?.style   ?? DEFAULT_STYLE);
  const [aiLoading, setAiLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [wifiQrUrl, setWifiQrUrl] = useState<string | null>(null);

  const previewRef  = useRef<HTMLDivElement>(null);
  const captureRef  = useRef<HTMLDivElement>(null);
  const pal         = PALETTES[style.palette];

  useEffect(() => {
    saveDraft(step, info, content, style);
  }, [step, info, content, style]);

  // ── Wi-Fi QR ──────────────────────────────────────────────────────────────
  const generateWifiQr = useCallback(async (name: string, password: string) => {
    if (!name && !password) return;
    try {
      const wifiString = `WIFI:T:WPA;S:${name};P:${password};;`;
      const QRCode     = (await import("qrcode")).default;
      const url        = await QRCode.toDataURL(wifiString, {
        width: 120, margin: 1, color: { dark: pal.primary },
      });
      setWifiQrUrl(url);
    } catch (err) {
      console.warn("QR generation failed:", err);
    }
  }, [pal.primary]);

  // ── Step 2 → 3: AI generate ───────────────────────────────────────────────
  const handleGeneratePreview = async () => {
    setAiLoading(true);
    try {
      const res  = await fetch("/api/airbnb/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ info, content, style }),
      });
      const { data } = await res.json();
      if (data) {
        setContent(prev => ({
          ...prev,
          welcomeNote:     data.welcomeNote     ?? prev.welcomeNote,
          rules:           data.rules           ?? prev.rules,
          recommendations: data.recommendations ?? prev.recommendations,
        }));
      }
    } catch (err) {
      console.warn("AI generation failed — using raw content:", err);
    }
    await generateWifiQr(info.wifiName, info.wifiPassword);
    setAiLoading(false);
    setStep(3);
  };

  // ── Export PDF — una sola página A4 ──────────────────────────────────────
  const handleExport = async () => {
    if (!captureRef.current) return;
    if (plan === "free") {
      const res  = await fetch("/api/export/use", { method: "POST" });
      const body = await res.json();
      if (!body.allowed) { handleUpgrade(); return; }
    }
    setExporting(true);
    try {
      const [html2canvas, { default: jsPDF }] = await Promise.all([
        import("html2canvas").then(m => m.default),
        import("jspdf"),
      ]);

      await waitForFonts();

      // Capturamos el div oculto (sin transform en ningún ancestro).
      // El div visible usa scale(0.72) → html2canvas hereda ese contexto
      // y rompe el kerning. El div oculto está a tamaño real sin transforms.
      const canvas = await html2canvas(captureRef.current, {
        scale:           2,
        useCORS:         true,
        allowTaint:      false,
        backgroundColor: pal.bg,
        logging:         false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.97);

      // Una sola página A4 — addImage rellena exactamente 210×297mm
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

      const filename = `${info.propertyName.replace(/\s+/g, "-") || "welcome-guide"}.pdf`;
      pdf.save(filename);
      clearDraft();
    } catch (err) {
      console.error("PDF export failed:", err);
    }
    setExporting(false);
  };

  const guideData: WelcomeGuideData = { info, content, style };

  return (
    <>
    {/* Div oculto a tamaño A4 real, sin transform en ningún ancestro.
        html2canvas captura este div → texto con kerning correcto. */}
    {step === 3 && (
      <div
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: 0, opacity: 0, pointerEvents: "none", zIndex: -1 }}
      >
        <PdfPreview
          data={guideData}
          wifiQrUrl={wifiQrUrl}
          previewRef={captureRef}
          isFree={plan === "free"}
        />
      </div>
    )}
    <ToolLayout
      title={t.airbnb.title}
      subtitle={t.airbnb.subtitle}
      tag={t.airbnb.tag}
    >
      <StepIndicator step={step} primary={pal.primary} />

      {step === 1 && <Step1 info={info} setInfo={setInfo} onNext={() => setStep(2)} />}

      {step === 2 && (
        <Step2
          content={content} setContent={setContent}
          onBack={() => setStep(1)} onNext={handleGeneratePreview}
          loading={aiLoading}
        />
      )}

      {step === 3 && (
        <Step3
          data={guideData} setStyle={setStyleData}
          wifiQrUrl={wifiQrUrl} previewRef={previewRef}
          onBack={() => setStep(2)} onExport={handleExport}
          exporting={exporting}
        />
      )}
    </ToolLayout>
    </>
  );
}
