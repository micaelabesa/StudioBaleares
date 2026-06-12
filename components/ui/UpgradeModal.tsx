"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { useLang }   from "@/contexts/LangContext";
import { Ornament }  from "./Ornament";

export function UpgradeModal() {
  const { showModal, closeModal, user } = useStudio();
  const { t }                           = useLang();
  const router                          = useRouter();
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  if (!showModal) return null;

  const u = t.upgrade;

  const handleCheckout = async () => {
    if (!user) {
      closeModal();
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.error) {
        setError(data.error === "Already Pro" ? u.alreadyPro : u.errorGeneral);
        setLoading(false);
        return;
      }

      if (data.url) window.location.href = data.url;
    } catch {
      setError(u.errorConn);
      setLoading(false);
    }
  };

  const plans = [
    { plan: u.freePlan, price: "€0",  sub: u.forever,    dark: false, features: u.freeFeatures },
    { plan: u.proPlan,  price: "€12", sub: u.priceMonth, dark: true,  features: u.proFeatures  },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(26,26,24,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        overflowY: "auto",
      }}
      onClick={closeModal}
    >
      <div
        style={{
          background: T.white, maxWidth: 520, width: "100%",
          padding: "32px 36px 28px", position: "relative",
          maxHeight: "92vh", overflowY: "auto",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          style={{ position: "absolute", top: 20, right: 24, fontSize: 20, color: T.mist }}
        >
          ×
        </button>

        <p className="tag" style={{ marginBottom: 8 }}>{u.tag}</p>
        <Ornament />
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>{u.title}</h2>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 14, marginBottom: 24 }}>
          {u.subtitle}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 20 }}>
          {plans.map(({ plan, price, sub, dark, features }, i) => (
            <div key={i} style={{
              padding: "18px 16px",
              background: dark ? T.ink : T.cream,
              color: dark ? T.white : T.ink,
              border: dark ? "none" : `1px solid ${T.sandDark}`,
            }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, opacity: 0.6 }}>
                {plan}
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 12 }}>
                {price} <span style={{ fontSize: 11, opacity: 0.5 }}>{sub}</span>
              </p>
              {features.map((f, fi) => (
                <div key={fi} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ color: dark ? "#6BFFB8" : T.terracotta, marginTop: 2 }}>✓</span>
                  <p style={{ fontSize: 12, opacity: 0.85 }}>{f}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 12, color: T.terracotta, marginBottom: 16, textAlign: "center" }}>
            {error}
          </p>
        )}

        <button
          className="btn-primary"
          style={{ width: "100%", padding: "12px 32px", fontSize: 11 }}
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span className="ldot" /><span className="ldot" /><span className="ldot" />
            </span>
          ) : (
            user ? u.ctaPro : u.ctaSignIn
          )}
        </button>

        <p style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: T.mist }}>
          {u.cancelNote}
        </p>
      </div>
    </div>
  );
}
