"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { useStudio } from "@/contexts/StudioContext";
import { useLang }   from "@/contexts/LangContext";
import { Ornament }  from "@/components/ui/Ornament";

const TOOL_HREFS = [
  "/studio/qrmenu",
  "/studio/social",
  "/studio/airbnb",
  "/studio/branding",
];

// Tools accessible on free plan (index)
const FREE_TOOLS = [0];

export default function SubscriptionPage() {
  const router = useRouter();
  const { plan, user, authLoading, handleUpgrade } = useStudio();
  const { t } = useLang();
  const s = t.subscription;

  const [confirming,    setConfirming]    = useState(false);
  const [cancelling,    setCancelling]    = useState(false);
  const [cancelled,     setCancelled]     = useState(false);
  const [error,         setError]         = useState("");

  const [deleteStep,    setDeleteStep]    = useState<"idle" | "warn" | "sending">("idle");
  const [deleteError,   setDeleteError]   = useState("");

  const handleRequestDelete = async () => {
    setDeleteStep("sending");
    setDeleteError("");
    try {
      const res = await fetch("/api/account/request-delete", { method: "POST" });
      if (!res.ok) { setDeleteStep("warn"); setDeleteError(s.deleteError); return; }
      router.push("/studio/confirm-delete");
    } catch {
      setDeleteStep("warn");
      setDeleteError(s.deleteError);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      const res  = await fetch("/api/stripe/cancel", { method: "POST" });
      const body = await res.json();
      if (!res.ok) { setError(body.error ?? "Something went wrong."); setCancelling(false); return; }
      setCancelled(true);
      setConfirming(false);
    } catch {
      setError("Network error. Please try again.");
    }
    setCancelling(false);
  };

  const layoutProps = { title: s.title, subtitle: s.subtitle, tag: s.tag };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <ToolLayout {...layoutProps}>
        <div style={{ display: "flex", gap: 6, paddingTop: 60 }}>
          <span className="ldot" /><span className="ldot" /><span className="ldot" />
        </div>
      </ToolLayout>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <ToolLayout {...layoutProps}>
        <div style={{ paddingTop: 40 }}>
          <p style={{ color: T.mist, marginBottom: 24 }}>{s.signInMsg}</p>
          <button className="btn-primary" onClick={() => router.push("/login")}>{s.signInBtn}</button>
        </div>
      </ToolLayout>
    );
  }

  const isPro = plan === "pro";

  return (
    <ToolLayout {...layoutProps}>
      <div style={{ maxWidth: 860 }}>

        {/* ── Plan + Account card ─────────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 2, marginBottom: 48,
        }}>

          {/* Plan card */}
          <div style={{
            padding: "28px 32px",
            background: isPro ? `${T.terracotta}0A` : T.sand,
            border: `1.5px solid ${isPro ? T.terracotta : T.sandDark}`,
          }}>
            <p className="tag" style={{ marginBottom: 12 }}>{isPro ? s.proPlan : s.freePlan}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36, color: isPro ? T.terracotta : T.ink, lineHeight: 1,
              }}>
                {isPro ? "€12" : "€0"}
              </span>
              <span style={{ fontSize: 12, color: T.mist }}>
                {isPro ? "/ month" : "forever"}
              </span>
            </div>
            {isPro ? (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 10, fontWeight: 500, letterSpacing: "0.14em",
                textTransform: "uppercase", color: T.terracotta,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.terracotta, display: "inline-block" }} />
                {s.statusActive}
              </span>
            ) : (
              <button
                className="btn-primary"
                style={{ fontSize: 10, padding: "7px 18px", marginTop: 4 }}
                onClick={handleUpgrade}
              >
                {s.upgradeTitle} →
              </button>
            )}
          </div>

          {/* Account card */}
          <div style={{
            padding: "28px 32px",
            background: T.white, border: `1px solid ${T.sandDark}`,
          }}>
            <p className="tag" style={{ marginBottom: 16 }}>{s.accountLabel}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mist, marginBottom: 4 }}>
                  Email
                </p>
                <p style={{ fontSize: 13, color: T.ink, wordBreak: "break-all" }}>{user.email}</p>
              </div>
              {isPro && (
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mist, marginBottom: 4 }}>
                    {s.billing.split("/")[0].trim()}
                  </p>
                  <p style={{ fontSize: 13, color: T.ink }}>{s.billing}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Your Studio / Tools ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 52 }}>
          <p className="tag" style={{ marginBottom: 6 }}>{s.toolsTitle}</p>
          <Ornament />
          <p style={{ fontSize: 13, color: T.mist, marginBottom: 28 }}>{s.toolsSubtitle}</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 2,
          }}>
            {s.tools.map((tool, i) => {
              const isFreeAccess = FREE_TOOLS.includes(i);
              const hasAccess    = isPro || isFreeAccess;
              const status       = isPro ? s.statusActive : isFreeAccess ? s.statusLimited : s.statusLocked;
              const statusColor  = isPro ? T.terracotta : isFreeAccess ? T.olive : T.mist;

              return (
                <div
                  key={tool.number}
                  style={{
                    padding: "24px 22px",
                    background: T.white,
                    border: `1px solid ${T.sandDark}`,
                    opacity: hasAccess ? 1 : 0.55,
                    display: "flex", flexDirection: "column", gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 32, color: T.sandDark, lineHeight: 1,
                    }}>
                      {tool.number}
                    </span>
                    <span style={{
                      fontSize: 8, fontWeight: 500, letterSpacing: "0.14em",
                      textTransform: "uppercase", color: statusColor,
                      border: `1px solid ${statusColor}`, padding: "3px 8px",
                    }}>
                      {status}
                    </span>
                  </div>

                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 4 }}>{tool.name}</p>
                    <p style={{ fontSize: 11, color: T.mist, lineHeight: 1.6 }}>{tool.desc}</p>
                  </div>

                  {hasAccess && (
                    <button
                      onClick={() => router.push(TOOL_HREFS[i])}
                      style={{
                        fontSize: 10, fontWeight: 500, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: T.terracotta,
                        background: "none", border: "none", cursor: "pointer",
                        padding: 0, textAlign: "left", marginTop: "auto",
                      }}
                    >
                      {s.openTool}
                    </button>
                  )}
                  {!hasAccess && (
                    <button
                      onClick={handleUpgrade}
                      style={{
                        fontSize: 10, fontWeight: 500, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: T.mist,
                        background: "none", border: "none", cursor: "pointer",
                        padding: 0, textAlign: "left", marginTop: "auto",
                      }}
                    >
                      {s.upgradeTitle} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── What's included ─────────────────────────────────────────────────── */}
        <div style={{
          padding: "28px 32px",
          background: T.sand, border: `1px solid ${T.sandDark}`,
          marginBottom: isPro ? 48 : 0,
        }}>
          <p className="field-label" style={{ marginBottom: 16 }}>{s.included}</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "8px 32px",
          }}>
            {(isPro ? s.proFeatures : s.freeFeatures).map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: isPro ? T.terracotta : T.mist, fontSize: 11, flexShrink: 0 }}>
                  {isPro ? "✓" : "·"}
                </span>
                <span style={{ fontSize: 12, color: T.ink }}>{f}</span>
              </div>
            ))}
          </div>

          {!isPro && (
            <div style={{ borderTop: `1px solid ${T.sandDark}`, marginTop: 24, paddingTop: 20 }}>
              <p style={{ fontSize: 13, color: T.mist, marginBottom: 16 }}>{s.upgradeDesc}</p>
              <button className="btn-primary" style={{ fontSize: 10, padding: "8px 20px" }} onClick={handleUpgrade}>
                {s.upgradeTitle} →
              </button>
            </div>
          )}
        </div>

        {/* ── Cancel flow (Pro only) ───────────────────────────────────────────── */}
        {isPro && !cancelled && (
          <div style={{ borderTop: `1px solid ${T.sandDark}`, paddingTop: 32 }}>
            <p className="field-label" style={{ marginBottom: 6 }}>{s.cancelTitle}</p>
            <p style={{ fontSize: 13, color: T.mist, marginBottom: 24, lineHeight: 1.65 }}>
              {s.cancelDesc}
            </p>

            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                style={{
                  fontSize: 11, letterSpacing: "0.08em", padding: "8px 18px",
                  border: "1px solid #C0392B", color: "#C0392B",
                  background: "transparent", cursor: "pointer",
                  opacity: 0.75, transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.75")}
              >
                {s.cancelBtn}
              </button>
            ) : (
              <div style={{ padding: "20px 24px", background: "#FFF8F8", border: "1px solid #C0392B28" }}>
                <p style={{ fontSize: 13, color: T.ink, marginBottom: 6, fontWeight: 500 }}>{s.confirmTitle}</p>
                <p style={{ fontSize: 12, color: T.mist, marginBottom: 20, lineHeight: 1.6 }}>{s.confirmDesc}</p>
                {error && <p style={{ fontSize: 12, color: "#C0392B", marginBottom: 16 }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    style={{
                      fontSize: 11, letterSpacing: "0.08em", padding: "8px 18px",
                      border: "1px solid #C0392B", color: "#C0392B",
                      background: "transparent",
                      cursor: cancelling ? "default" : "pointer",
                      opacity: cancelling ? 0.5 : 1,
                    }}
                  >
                    {cancelling ? "…" : s.confirmYes}
                  </button>
                  <button
                    className="btn-primary"
                    style={{ fontSize: 11 }}
                    onClick={() => { setConfirming(false); setError(""); }}
                    disabled={cancelling}
                  >
                    {s.keepPro}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Post-cancel ──────────────────────────────────────────────────────── */}
        {cancelled && (
          <div style={{ padding: "24px 28px", background: T.sand, border: `1px solid ${T.sandDark}` }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 8 }}>{s.cancelledTitle}</p>
            <p style={{ fontSize: 13, color: T.mist, lineHeight: 1.65 }}>{s.cancelledDesc}</p>
          </div>
        )}

        {/* ── Delete account ───────────────────────────────────────────────────── */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid #C0392B28` }}>
          <p className="field-label" style={{ color: "#C0392B", marginBottom: 6 }}>{s.deleteTitle}</p>

          {deleteStep === "idle" && (
            <>
              <p style={{ fontSize: 13, color: T.mist, marginBottom: 20, lineHeight: 1.65 }}>{s.deleteDesc}</p>
              <button
                onClick={() => setDeleteStep("warn")}
                style={{
                  fontSize: 11, letterSpacing: "0.08em", padding: "8px 18px",
                  border: "1px solid #C0392B55", color: "#C0392B",
                  background: "transparent", cursor: "pointer", opacity: 0.7,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.7")}
              >
                {s.deleteBtn}
              </button>
            </>
          )}

          {deleteStep === "warn" && (
            <div style={{ padding: "20px 24px", background: "#FFF8F8", border: "1px solid #C0392B28" }}>
              <p style={{ fontSize: 13, color: T.ink, marginBottom: 6, fontWeight: 500 }}>{s.deleteDesc}</p>
              <p style={{ fontSize: 12, color: T.mist, marginBottom: 20, lineHeight: 1.6 }}>
                {s.confirmDelete.desc}
              </p>
              {deleteError && <p style={{ fontSize: 12, color: "#C0392B", marginBottom: 16 }}>{deleteError}</p>}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={handleRequestDelete}
                  style={{
                    fontSize: 11, letterSpacing: "0.08em", padding: "8px 18px",
                    border: "1px solid #C0392B", color: "#C0392B",
                    background: "transparent", cursor: "pointer",
                  }}
                >
                  {s.deleteBtn}
                </button>
                <button
                  className="btn-primary"
                  style={{ fontSize: 11 }}
                  onClick={() => { setDeleteStep("idle"); setDeleteError(""); }}
                >
                  {s.confirmDelete.cancel}
                </button>
              </div>
            </div>
          )}

          {deleteStep === "sending" && (
            <div style={{ display: "flex", gap: 6, paddingTop: 4 }}>
              <span className="ldot" /><span className="ldot" /><span className="ldot" />
            </div>
          )}


        </div>

      </div>
    </ToolLayout>
  );
}
