"use client";

import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { useStudio } from "@/contexts/StudioContext";
import { useLang } from "@/contexts/LangContext";

interface ComingSoonProps {
  title: string;
  subtitle: string;
  tag: string;
  features: string[];
}

export function ComingSoon({ title, subtitle, tag, features }: ComingSoonProps) {
  const { plan } = useStudio();
  const router   = useRouter();
  const { t }    = useLang();

  return (
    <ToolLayout title={title} subtitle={subtitle} tag={tag} showBanner={plan === "free"}>
      <div style={{ maxWidth: 540, textAlign: "center", margin: "0 auto", padding: "52px 0" }}>
        <div style={{
          width: 68, height: 68, border: `1.5px solid ${T.sandDark}`,
          margin: "0 auto 34px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 18, height: 18, background: T.sandDark }} />
        </div>

        <h3 style={{ fontSize: 26, marginBottom: 14 }}>{t.comingSoon.inDev}</h3>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 17, marginBottom: 42, lineHeight: 1.8 }}>
          {t.comingSoon.crafted}
        </p>

        <div style={{ textAlign: "left", maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 5, height: 5, background: T.terracotta, marginTop: 9, flexShrink: 0 }} />
              <p style={{ fontSize: 14, color: T.inkLight }}>{f}</p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 40, color: T.mist, fontSize: 13 }}>
          {t.comingSoon.startWith}
        </p>
        <button className="btn-outline" style={{ marginTop: 18 }} onClick={() => router.push("/studio/qrmenu")}>
          {t.comingSoon.tryQr}
        </button>
      </div>
    </ToolLayout>
  );
}
