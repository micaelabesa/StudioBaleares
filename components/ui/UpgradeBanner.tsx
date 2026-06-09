"use client";

import { T } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";

export function UpgradeBanner() {
  const { handleUpgrade } = useStudio();

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: T.ink, color: T.white,
      padding: "12px 24px", marginBottom: 32,
      borderLeft: `3px solid ${T.terracotta}`,
    }}>
      <div>
        <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em" }}>
          Free plan — 1 export/day · watermark enabled
        </span>
        <span style={{ fontSize: 12, color: T.mist, marginLeft: 12 }}>
          Upgrade to remove limits
        </span>
      </div>
      <button
        className="btn-outline"
        style={{ color: T.white, borderColor: T.white, padding: "6px 20px", fontSize: 10 }}
        onClick={handleUpgrade}
      >
        Upgrade → Pro
      </button>
    </div>
  );
}
