"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { useLang } from "@/contexts/LangContext";
import { Ornament } from "@/components/ui/Ornament";

export default function LoginPage() {
  const { signIn }              = useStudio();
  const router                  = useRouter();
  const { t }                   = useLang();
  const [email, setEmail]       = useState("");
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const { error: err } = await signIn(email.trim());

    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${T.sand} 0%, ${T.cream} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: T.white,
        maxWidth: 420, width: "100%",
        padding: "56px 48px",
        border: `1px solid ${T.sandDark}`,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 22, height: 22,
            border: `1.5px solid ${T.terracotta}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotate(45deg)",
          }}>
            <div style={{ width: 7, height: 7, background: T.terracotta }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: T.ink }}>
            Studio Baleares
          </span>
        </div>

        {!sent ? (
          <>
            <p className="tag" style={{ marginBottom: 10 }}>Mediterranean Studio</p>
            <Ornament />
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>{t.login.title}</h1>
            <p className="serif" style={{
              fontStyle: "italic", color: T.mist, fontSize: 15,
              marginBottom: 36, lineHeight: 1.7,
            }}>
              {t.login.subtitle}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label className="field-label">{t.login.label}</label>
              <input
                className="field-input"
                type="email"
                placeholder={t.login.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
              />
            </div>

            {error && (
              <p style={{ fontSize: 12, color: T.terracotta, marginBottom: 16 }}>{error}</p>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%", padding: "14px 32px" }}
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="ldot" /><span className="ldot" /><span className="ldot" />
                </span>
              ) : t.login.btn}
            </button>

            <button
              className="btn-ghost"
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => router.push("/")}
            >
             {t.login.skip}
            </button>

            <p style={{ fontSize: 11, color: T.mist, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
              {t.login.footer}
            </p>
          </>
        ) : (
          /* Sent state */
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 52, height: 52,
              border: `1.5px solid ${T.terracotta}`,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
              fontSize: 22,
            }}>
              ✦
            </div>
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>{t.login.sent.title}</h2>
            <p className="serif" style={{
              fontStyle: "italic", color: T.mist,
              fontSize: 15, lineHeight: 1.7, marginBottom: 28,
            }}>
              {t.login.sent.subtitle}<br />
              <strong style={{ color: T.ink, fontStyle: "normal" }}>{email}</strong>
            </p>
            <p style={{ fontSize: 12, color: T.mist, marginBottom: 28 }}>
              {t.login.sent.body}
            </p>
            <button
              className="btn-ghost"
              style={{ fontSize: 10 }}
              onClick={() => { setSent(false); setEmail(""); }}
            >
              {t.login.sent.change}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
