"use client";

import { useRef, useState } from "react";
import { ToolLayout }    from "@/components/layout/ToolLayout";
import { StepIndicator } from "@/components/tools/shared/StepIndicator";
import { StepBrandInfo } from "@/components/tools/branding/StepBrandInfo";
import { BrandCard }     from "@/components/tools/branding/BrandCard";
import { useStudio }     from "@/contexts/StudioContext";
import { useLang }       from "@/contexts/LangContext";
import { T }             from "@/lib/constants";
import type { BrandKit } from "@/app/api/generate-branding/route";

export default function BrandingPage() {
  const { plan, handleUpgrade } = useStudio();
  const { t } = useLang();

  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error,       setError]       = useState("");
  const [kit,         setKit]         = useState<BrandKit | null>(null);

  const [venueName,      setVenueName]      = useState("");
  const [venueType,      setVenueType]      = useState("");
  const [keywords,       setKeywords]       = useState("");
  const [colorDirection, setColorDirection] = useState("");

  const captureRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: string) => {
    if (field === "venueName")      setVenueName(value);
    if (field === "venueType")      setVenueType(value);
    if (field === "keywords")       setKeywords(value);
    if (field === "colorDirection") setColorDirection(value);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/generate-branding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ venueName, venueType, keywords, colorDirection }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Generation failed");
      setKit(data.kit as BrandKit);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!captureRef.current || !kit) return;

    if (plan === "free") {
      const check = await fetch("/api/export/use", { method: "POST" });
      const { allowed } = await check.json() as { allowed: boolean };
      if (!allowed) { handleUpgrade(); return; }
    }

    setDownloading(true);
    try {
      await document.fonts.ready;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(captureRef.current, {
        scale:           2,
        useCORS:         true,
        backgroundColor: "#FDFCF9",
        logging:         false,
      });
      const link      = document.createElement("a");
      link.download   = `${venueName.replace(/\s+/g, "-").toLowerCase()}-brand-kit.png`;
      link.href       = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    }
    setDownloading(false);
  };

  const primaryHex = kit?.colors.find(c => c.role === "primary")?.hex ?? "#C4693A";

  return (
    <ToolLayout
      title={t.branding.title}
      subtitle={t.branding.subtitle}
      tag={t.branding.tag}
      showBanner={plan === "free"}
    >
      <StepIndicator
        steps={[...t.branding.steps]}
        current={step}
        activePrimary={primaryHex}
        onStepClick={(n) => { if (n < step) setStep(n); }}
      />

      {step === 1 && (
        <StepBrandInfo
          venueName={venueName}
          venueType={venueType}
          keywords={keywords}
          colorDirection={colorDirection}
          onChange={handleChange}
          onGenerate={handleGenerate}
          loading={loading}
          error={error}
        />
      )}

      {step === 2 && kit && (
        <div>
          {/* Action bar */}
          <div style={{ display: "flex", gap: 12, marginBottom: 32, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? t.branding.downloadingBtn : t.branding.downloadBtn}
            </button>
            <button
              className="btn-ghost"
              style={{ fontSize: 11 }}
              onClick={() => { setStep(1); setKit(null); setError(""); }}
            >
              {t.branding.startOver}
            </button>
            {plan === "free" && (
              <span style={{ fontSize: 11, color: T.mist, marginLeft: 4 }}>
                {t.branding.freeLimit}
              </span>
            )}
          </div>

          {/* On-screen preview */}
          <div style={{
            maxWidth: 680,
            border: `1px solid ${T.sandDark}`,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(26,26,24,0.06)",
          }}>
            <BrandCard
              kit={kit}
              venueName={venueName}
              showWatermark={plan === "free"}
            />
          </div>
        </div>
      )}

      {/* Off-screen capture target — full size, no transforms */}
      {kit && (
        <div aria-hidden style={{ position: "fixed", top: 0, left: 0, opacity: 0, pointerEvents: "none", zIndex: -1 }}>
          <BrandCard
            ref={captureRef}
            kit={kit}
            venueName={venueName}
            showWatermark={plan === "free"}
          />
        </div>
      )}
    </ToolLayout>
  );
}
