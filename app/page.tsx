"use client";

import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { useLang }   from "@/contexts/LangContext";
import { Ornament }  from "@/components/ui/Ornament";
import { ProBadge }  from "@/components/ui/ProBadge";
import Logo          from "@/components/ui/Logo";

const TOOL_KEYS = [
  { href: "/studio/qrmenu",   number: "01", tag: "Most Popular", tagEs: "Más Popular",    tagColor: "var(--terracotta)", live: true  },
  { href: "/studio/social",   number: "02", tag: "AI-Powered",   tagEs: "Con IA",          tagColor: "var(--olive)",      live: false },
  { href: "/studio/airbnb",   number: "03", tag: "New",          tagEs: "Nuevo",           tagColor: "var(--sea)",        live: false },
  { href: "/studio/branding", number: "04", tag: "Coming Soon",  tagEs: "Próximamente",    tagColor: "var(--mist)",       live: false },
] as const;

const TOOL_CONTENT = {
  en: [
    { title: "QR Menu Generator",      sub: "Digital menus with instant QR code",     desc: "Enter your menu items, pick a palette, and get a beautiful scannable QR menu — ready in 3 minutes." },
    { title: "Social Post Generator",  sub: "Stories, promos & announcements",        desc: "The AI detects pizza, brunch, cocktails — and generates on-brand captions and Instagram layouts for you." },
    { title: "Welcome PDF Generator",  sub: "Airbnb & hotel welcome guides",          desc: "Wifi, house rules, local tips — all formatted beautifully in a PDF your guests will actually read." },
    { title: "Mini Branding Kit",      sub: "Palette, fonts & logo starter",          desc: "Answer 5 questions and receive a curated Mediterranean brand palette, font pairing and logo mark." },
  ],
  es: [
    { title: "Generador de Menú QR",   sub: "Menús digitales con código QR al instante", desc: "Introduce tus platos, elige una paleta y obtén un menú QR escaneable — listo en 3 minutos." },
    { title: "Generador de Posts",     sub: "Stories, promos y anuncios",               desc: "La IA detecta pizza, brunch, cócteles — y genera descripciones e Instagram layouts a tu medida." },
    { title: "Generador de PDF",       sub: "Guías de bienvenida para Airbnb y hoteles", desc: "Wifi, normas, consejos locales — todo formateado en un PDF que tus huéspedes querrán leer." },
    { title: "Kit de Branding Mini",   sub: "Paleta, tipografías y logo inicial",       desc: "Responde 5 preguntas y recibe una paleta mediterránea, tipografías y un logo adaptado a tu negocio." },
  ],
};

export default function HomePage() {
  const router                  = useRouter();
  const { plan, handleUpgrade } = useStudio();
  const { lang, t }             = useLang();
  const tools                   = TOOL_CONTENT[lang];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 40px 80px",
        background: `linear-gradient(180deg, ${T.sand} 0%, ${T.cream} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        <svg style={{ position: "absolute", top: 70, right: 50, opacity: 0.07, pointerEvents: "none" }}
          width="110" height="170" viewBox="0 0 110 170">
          <path d="M55 165 Q50 125 35 95 Q20 65 25 35 Q30 8 55 8" stroke="#6B7A4A" strokeWidth="1.5" fill="none" />
          {[28, 50, 72, 94, 116, 138].map((y, i) => (
            <ellipse key={i} cx={i % 2 === 0 ? 32 : 78} cy={y} rx="16" ry="8" fill="#6B7A4A"
              transform={`rotate(${i % 2 === 0 ? -28 : 28} ${i % 2 === 0 ? 32 : 78} ${y})`} />
          ))}
        </svg>

        <div className="fu" style={{ maxWidth: 660, position: "relative" }}>
          <p className="tag" style={{ marginBottom: 18 }}>{t.hero.tag}</p>
          <div style={{ marginBottom: 32 }}>
            <Logo variant="hero" />
          </div>
          <h1 style={{ fontSize: "clamp(40px, 6vw, 70px)", fontWeight: 400, color: T.ink, lineHeight: 1.15, marginBottom: 28 }}>
            {t.hero.title1}<br />
            <em style={{ color: T.terracotta }}>{t.hero.title2}</em><br />
            {t.hero.title3}
          </h1>
          <div className="divider" />
          <p className="serif fu1" style={{ fontSize: 18, color: T.inkLight, fontStyle: "italic", maxWidth: 480, margin: "22px auto 36px", lineHeight: 1.8 }}>
            {t.hero.subtitle}
          </p>
          <div className="fu2" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => router.push("/studio/qrmenu")}>{t.hero.cta}</button>
            <button className="btn-outline" onClick={() => router.push("/preview")}>{t.hero.preview}</button>
          </div>
          <p className="fu3 tag" style={{ marginTop: 28 }}>{t.hero.badge}</p>
        </div>

        <div style={{ position: "absolute", bottom: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: T.terracotta }} />
        </div>
      </section>

      {/* ── Strip ────────────────────────────────────────────────────────────── */}
      <div style={{ background: T.ink, color: T.white, padding: "18px 60px", display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
        {t.strip.map((item, i) => (
          <span key={i} style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.6 }}>{item}</span>
        ))}
      </div>

      {/* ── Tools ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "90px 60px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="tag">{t.tools.tag}</p>
          <Ornament />
          <h2 style={{ fontSize: 36, color: T.ink }}>{t.tools.title}</h2>
          <p style={{ color: T.mist, marginTop: 14, maxWidth: 440, margin: "14px auto 0", fontSize: 15 }}>{t.tools.subtitle}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
          {TOOL_KEYS.map((key, i) => {
            const tool        = tools[i];
            const isComingSoon = lang === "en" ? key.tag === "Coming Soon" : key.tagEs === "Próximamente";
            const tagLabel    = lang === "en" ? key.tag : key.tagEs;
            return (
              <div
                key={key.href}
                className={`tool-card ${isComingSoon ? "disabled" : ""}`}
                style={{ padding: "44px 32px" }}
                onClick={() => !isComingSoon && router.push(key.href)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, color: T.sandDark, lineHeight: 1 }}>
                    {key.number}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: key.tagColor, border: `1px solid ${key.tagColor}`, padding: "4px 10px" }}>
                      {tagLabel}
                    </span>
                    {!key.live && !isComingSoon && <span style={{ fontSize: 9, color: T.mist }}>Pro <ProBadge /></span>}
                  </div>
                </div>
                <h3 style={{ fontSize: 21, color: T.ink, marginBottom: 7 }}>{tool.title}</h3>
                <p className="tag" style={{ marginBottom: 14 }}>{tool.sub}</p>
                <p style={{ fontSize: 14, color: T.mist, lineHeight: 1.7 }}>{tool.desc}</p>
                {!isComingSoon && (
                  <p style={{ marginTop: 28, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: T.terracotta }}>
                    {key.live ? t.tools.open : t.tools.soon}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "90px 60px", background: T.sand }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p className="tag">{t.pricing.tag}</p>
          <Ornament />
          <h2 style={{ fontSize: 36 }}>{t.pricing.title}</h2>
          <p style={{ color: T.mist, marginTop: 14, fontSize: 15 }}>{t.pricing.subtitle}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, maxWidth: 640, margin: "0 auto" }}>
          {([t.pricing.free, t.pricing.pro] as const).map((p, i) => {
            const dark     = i === 1;
            const features = dark ? t.pricing.features.pro : t.pricing.features.free;
            return (
              <div key={i} style={{ padding: "40px 36px", background: dark ? T.ink : T.white, color: dark ? T.white : T.ink, border: dark ? "none" : `1px solid ${T.sandDark}` }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5, marginBottom: 16 }}>{p.plan}</p>
                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 48 }}>{p.price}</span>
                  <span style={{ fontSize: 13, opacity: 0.5, marginLeft: 6 }}>{p.sub}</span>
                </div>
                {features.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <span style={{ color: dark ? "#6BFFB8" : T.terracotta, fontSize: 14 }}>✓</span>
                    <span style={{ fontSize: 14, opacity: 0.85 }}>{f}</span>
                  </div>
                ))}
                <button
                  className={dark ? "btn-primary" : "btn-ghost"}
                  style={{ marginTop: 32, width: "100%" }}
                  onClick={dark ? handleUpgrade : () => router.push("/studio/qrmenu")}
                >
                  {p.cta}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "90px 60px", background: T.ink, color: T.white, textAlign: "center" }}>
        <p className="tag" style={{ color: T.mist }}>{t.how.tag}</p>
        <Ornament />
        <h2 style={{ fontSize: 36, marginBottom: 60 }}>{t.how.title}</h2>
        <div style={{ display: "flex", maxWidth: 760, margin: "0 auto" }}>
          {t.how.steps.map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "0 28px", position: "relative" }}>
              {i < 2 && <div style={{ position: "absolute", top: 20, right: 0, width: 1, height: 36, background: T.mist, opacity: 0.2 }} />}
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, color: T.terracotta, opacity: 0.35, lineHeight: 1, marginBottom: 18 }}>{s.n}</p>
              <h3 style={{ fontSize: 19, marginBottom: 10, fontWeight: 400 }}>{s.t}</h3>
              <p style={{ fontSize: 14, color: T.mist, lineHeight: 1.7 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "90px 60px", textAlign: "center", background: T.cream }}>
        <h2 style={{ fontSize: 36, marginBottom: 20 }}>{t.cta.title}</h2>
        <p className="serif" style={{ fontStyle: "italic", color: T.inkLight, marginBottom: 36, fontSize: 17 }}>{t.cta.subtitle}</p>
        <button className="btn-primary" onClick={() => router.push("/studio/qrmenu")}>{t.cta.btn}</button>
      </section>
    </div>
  );
}
