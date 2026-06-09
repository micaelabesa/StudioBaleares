"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { useStudio } from "@/contexts/StudioContext";
import { useLang } from "@/contexts/LangContext";

export default function SubscriptionPage() {
  const router = useRouter();
  const { plan, user, authLoading, handleUpgrade } = useStudio();
  const { t } = useLang();

  const [confirming,  setConfirming]  = useState(false);
  const [cancelling,  setCancelling]  = useState(false);
  const [cancelled,   setCancelled]   = useState(false);
  const [error,       setError]       = useState("");

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      const res  = await fetch("/api/stripe/cancel", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        setCancelling(false);
        return;
      }
      setCancelled(true);
      setConfirming(false);
    } catch {
      setError("Network error. Please try again.");
    }
    setCancelling(false);
  };

  const toolLayoutProps = {
    title:    t.subscription.title,
    subtitle: t.subscription.subtitle,
    tag:      t.subscription.tag,
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <ToolLayout {...toolLayoutProps}>
        <div style={{ display: "flex", gap: 6, paddingTop: 60 }}>
          <span className="ldot" /><span className="ldot" /><span className="ldot" />
        </div>
      </ToolLayout>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <ToolLayout {...toolLayoutProps}>
        <div style={{ paddingTop: 40 }}>
          <p style={{ color: T.mist, marginBottom: 24 }}>{t.subscription.signInMsg}</p>
          <button className="btn-primary" onClick={() => router.push("/login")}>{t.subscription.signInBtn}</button>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout {...toolLayoutProps}>
      <div style={{ maxWidth: 520 }}>

        {/* Plan badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          padding: "12px 20px",
          border: `1.5px solid ${plan === "pro" ? T.terracotta : T.sandDark}`,
          background: plan === "pro" ? `${T.terracotta}0D` : T.sand,
          marginBottom: 40,
        }}>
          <div style={{ width: 8, height: 8, background: plan === "pro" ? T.terracotta : T.mist }} />
          <span style={{
            fontSize: 13, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: plan === "pro" ? T.terracotta : T.ink,
          }}>
            {plan === "pro" ? t.subscription.proPlan : t.subscription.freePlan}
          </span>
          {plan === "pro" && (
            <span style={{ fontSize: 11, color: T.terracotta, letterSpacing: "0.05em" }}>✦</span>
          )}
        </div>

        {/* Features */}
        <div style={{ marginBottom: 48 }}>
          <p className="field-label" style={{ marginBottom: 16 }}>{t.subscription.included}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(plan === "pro" ? t.subscription.proFeatures : t.subscription.freeFeatures).map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: plan === "pro" ? T.terracotta : T.mist, fontSize: 12, flexShrink: 0 }}>
                  {plan === "pro" ? "✓" : "·"}
                </span>
                <span style={{ fontSize: 13, color: T.ink }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Free → upgrade */}
        {plan === "free" && (
          <div style={{ padding: "24px 28px", background: T.sand, border: `1px solid ${T.sandDark}` }}>
            <p className="tag" style={{ marginBottom: 8 }}>✦ {t.subscription.upgradeTitle}</p>
            <p style={{ fontSize: 13, color: T.mist, marginBottom: 20, lineHeight: 1.65 }}>
              {t.subscription.upgradeDesc}
            </p>
            <button className="btn-primary" onClick={handleUpgrade}>{t.subscription.upgradeTitle} →</button>
          </div>
        )}

        {/* Pro → cancel flow */}
        {plan === "pro" && !cancelled && (
          <div style={{ borderTop: `1px solid ${T.sandDark}`, paddingTop: 32 }}>
            <p className="field-label" style={{ marginBottom: 6 }}>{t.subscription.cancelTitle}</p>
            <p style={{ fontSize: 13, color: T.mist, marginBottom: 24, lineHeight: 1.65 }}>
              {t.subscription.cancelDesc}
            </p>

            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                style={{
                  fontSize: 11, letterSpacing: "0.08em", padding: "8px 18px",
                  border: "1px solid #C0392B", color: "#C0392B",
                  background: "transparent", cursor: "pointer", opacity: 0.75,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.75")}
              >
                {t.subscription.cancelBtn}
              </button>
            ) : (
              <div style={{ padding: "20px 24px", background: "#FFF8F8", border: "1px solid #C0392B28" }}>
                <p style={{ fontSize: 13, color: T.ink, marginBottom: 6, fontWeight: 500 }}>
                  {t.subscription.confirmTitle}
                </p>
                <p style={{ fontSize: 12, color: T.mist, marginBottom: 20, lineHeight: 1.6 }}>
                  {t.subscription.confirmDesc}
                </p>
                {error && <p style={{ fontSize: 12, color: "#C0392B", marginBottom: 16 }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    style={{
                      fontSize: 11, letterSpacing: "0.08em", padding: "8px 18px",
                      border: "1px solid #C0392B", color: "#C0392B",
                      background: "transparent", cursor: cancelling ? "default" : "pointer",
                      opacity: cancelling ? 0.5 : 1,
                    }}
                  >
                    {cancelling ? "…" : t.subscription.confirmYes}
                  </button>
                  <button
                    className="btn-primary"
                    style={{ fontSize: 11 }}
                    onClick={() => { setConfirming(false); setError(""); }}
                    disabled={cancelling}
                  >
                    {t.subscription.keepPro}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Post-cancel confirmation */}
        {cancelled && (
          <div style={{ padding: "24px 28px", background: T.sand, border: `1px solid ${T.sandDark}` }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 8 }}>
              {t.subscription.cancelledTitle}
            </p>
            <p style={{ fontSize: 13, color: T.mist, lineHeight: 1.65 }}>
              {t.subscription.cancelledDesc}
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
