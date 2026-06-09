"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { Ornament } from "./Ornament";

export function UpgradeModal() {
  const { showModal, closeModal, user } = useStudio();
  const router                          = useRouter();
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  if (!showModal) return null;

  const handleCheckout = async () => {
    // Si no está logueado, lo mandamos a login primero
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
        setError(data.error === "Already Pro"
          ? "You already have a Pro plan."
          : "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Redirige a Stripe Checkout
      if (data.url) window.location.href = data.url;

    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  const plans = [
    {
      plan: "Free", price: "€0", sub: "forever", dark: false,
      features: ["1 export per day", "1 palette", "Watermark on exports", "Basic templates"],
    },
    {
      plan: "Pro", price: "€12", sub: "/ month", dark: true,
      features: ["Unlimited exports", "All 4 palettes", "No watermark", "All templates + new ones"],
    },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(26,26,24,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={closeModal}
    >
      <div
        style={{
          background: T.white, maxWidth: 520, width: "100%",
          padding: "56px 48px", position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          style={{ position: "absolute", top: 20, right: 24, fontSize: 20, color: T.mist }}
        >
          ×
        </button>

        <p className="tag" style={{ marginBottom: 12 }}>Mediterranean Studio</p>
        <Ornament />
        <h2 style={{ fontSize: 30, marginBottom: 8 }}>Upgrade to Pro</h2>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 16, marginBottom: 40 }}>
          Everything you need to look world-class — no agency required.
        </p>

        {/* Plan comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 36 }}>
          {plans.map(({ plan, price, sub, dark, features }, i) => (
            <div key={i} style={{
              padding: "28px 24px",
              background: dark ? T.ink : T.cream,
              color: dark ? T.white : T.ink,
              border: dark ? "none" : `1px solid ${T.sandDark}`,
            }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, opacity: 0.6 }}>
                {plan}
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 20 }}>
                {price} <span style={{ fontSize: 13, opacity: 0.5 }}>{sub}</span>
              </p>
              {features.map((f, fi) => (
                <div key={fi} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ color: dark ? "#6BFFB8" : T.terracotta, marginTop: 2 }}>✓</span>
                  <p style={{ fontSize: 13, opacity: 0.85 }}>{f}</p>
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
          style={{ width: "100%", padding: "14px 32px", fontSize: 12 }}
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span className="ldot" /><span className="ldot" /><span className="ldot" />
            </span>
          ) : (
            user ? "Get Pro — €12/month" : "Sign in to Upgrade"
          )}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: T.mist }}>
          Cancel anytime · Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}
