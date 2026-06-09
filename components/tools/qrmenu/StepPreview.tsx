"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { T } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { MenuPreview } from "@/components/tools/shared/MenuPreview";
import type { GeneratedMenu } from "@/lib/types";

interface StepPreviewProps {
  generated: GeneratedMenu;
  qrDataUrl: string | null;
  activePrimary: string;
  activeBg: string;
  exported: boolean;
  onExport: () => void;
  onStartOver: () => void;
}

export function StepPreview({
  generated, qrDataUrl, activePrimary, activeBg,
  exported, onExport, onStartOver,
}: StepPreviewProps) {
  const { plan, handleUpgrade } = useStudio();
  const router                  = useRouter();
  const menuRef                 = useRef<HTMLDivElement>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  // ── PDF export — captures only the menu div, never the full page ────────────
  const handleExportPDF = async () => {
    if (!menuRef.current) return;
    setExportingPdf(true);

    try {
      const canvas = await html2canvas(menuRef.current, {
        scale: 2,                  // 2× resolution for sharp print quality
        useCORS: true,
        backgroundColor: activeBg,
        logging: false,
      });

      const imgData   = canvas.toDataURL("image/png");
      const pdf       = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW     = pdf.internal.pageSize.getWidth();
      const pageH     = pdf.internal.pageSize.getHeight();
      const imgH      = (canvas.height * pageW) / canvas.width; // scaled height in mm

      // Multi-page support — adds a new page whenever content overflows
      let heightLeft = imgH;
      let position   = 0;

      pdf.addImage(imgData, "PNG", 0, position, pageW, imgH);
      heightLeft -= pageH;

      while (heightLeft > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageW, imgH);
        heightLeft -= pageH;
      }

      pdf.save(`${generated.restaurantName.replace(/\s+/g, "-")}-menu.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    }

    setExportingPdf(false);
  };

  return (
    <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 52 }}>

      {/* Menu preview — ref attached here, this is all that goes into the PDF */}
      <div ref={menuRef}>
        <MenuPreview
          menu={generated}
          primaryColor={activePrimary}
          bgColor={activeBg}
          watermark={plan === "free"}
        />
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* QR card */}
        <div style={{ background: T.white, border: `1px solid ${T.sandDark}`, padding: "32px 24px", textAlign: "center" }}>
          <p className="tag" style={{ marginBottom: 16 }}>Your QR Code</p>
          {qrDataUrl && (
            <>
              <img
                src={qrDataUrl}
                alt="QR code"
                style={{ width: 150, height: 150, display: "block", margin: "0 auto 12px" }}
              />
              <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 12 }}>
                {generated.restaurantName}
              </p>
              {plan === "free" && (
                <p style={{ fontSize: 10, color: T.mist, marginTop: 8, letterSpacing: "0.08em" }}>
                  Watermark removed with Pro
                </p>
              )}
            </>
          )}
        </div>

        {/* Download QR */}
        <button
          className="btn-primary"
          onClick={plan === "free" && exported ? handleUpgrade : onExport}
          disabled={!qrDataUrl}
        >
          {plan === "free" && exported ? "↑ Upgrade to Download Again" : "↓ Download QR Code"}
        </button>

        {/* Export PDF — the real one */}
        <button
          className="btn-outline"
          onClick={handleExportPDF}
          disabled={exportingPdf}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {exportingPdf ? (
            <>
              <span className="ldot" /><span className="ldot" /><span className="ldot" />
              &nbsp;Generating PDF…
            </>
          ) : "↓ Export Menu as PDF"}
        </button>

        <button className="btn-ghost" onClick={onStartOver}>← Start over</button>

        {/* Free upsell */}
        {plan === "free" && (
          <div style={{ padding: 20, background: T.sand, border: `1px solid ${T.sandDark}` }}>
            <p className="tag" style={{ marginBottom: 6 }}>✦ Unlock everything</p>
            <p style={{ fontSize: 13, color: T.mist, marginBottom: 14, lineHeight: 1.6 }}>
              Remove watermark, unlock all palettes, and export unlimited times.
            </p>
            <button
              className="btn-primary"
              style={{ width: "100%", fontSize: 10 }}
              onClick={handleUpgrade}
            >
              Upgrade to Pro — €12/mo
            </button>
          </div>
        )}

        {/* Next step */}
        <div style={{ padding: "18px 20px", background: T.cream, border: `1px solid ${T.sandDark}` }}>
          <p className="tag" style={{ marginBottom: 6 }}>✦ Next</p>
          <p style={{ fontSize: 13, color: T.mist, marginBottom: 14 }}>
            Generate Instagram posts from your menu automatically.
          </p>
          <button
            className="btn-outline"
            style={{ fontSize: 10, padding: "8px 16px", width: "100%" }}
            onClick={() => router.push("/studio/social")}
          >
            Social Post Generator →
          </button>
        </div>

      </div>
    </div>
  );
}
