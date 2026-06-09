"use client";

import { useState } from "react";
import { PALETTES } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { createClient } from "@/lib/supabase/client";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { StepIndicator } from "@/components/tools/shared/StepIndicator";
import { StepPostInfo } from "@/components/tools/social/StepPostInfo";
import { StepPostType } from "@/components/tools/social/StepPostType";
import { StepPostPreview } from "@/components/tools/social/StepPostPreview";
import type { GeneratedPost } from "@/app/api/generate-social/route";
import { useLang } from "@/contexts/LangContext";

type Format = "feed" | "story" | "promo";
type Tone   = "elegant" | "warm" | "minimal";

export default function SocialPage() {
  const { plan, user, handleUpgrade } = useStudio();
  const { t } = useLang();

  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [generated, setGenerated]     = useState<GeneratedPost | null>(null);
  const [errorMsg, setErrorMsg]       = useState("");

  const [info, setInfo] = useState({ name: "", cuisine: "", topic: "", context: "" });
  const [format, setFormat]   = useState<Format>("feed");
  const [tone, setTone]       = useState<Tone>("elegant");
  const [palette, setPalette] = useState("terracotta");

  const pal           = PALETTES[palette];
  const activePrimary = pal?.primary ?? "#C4693A";

  const handleLoadMenu = async () => {
    if (!user) return;
    setLoadingMenu(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("menus")
        .select("data, palette")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // single() lanza excepción con 0 filas; maybeSingle() devuelve null
      if (data) {
        const menu = data.data as { restaurantName: string };
        setInfo((i) => ({ ...i, name: menu.restaurantName ?? i.name }));
        if (data.palette) setPalette(data.palette);
      }
    } catch { /* silently fail */ }
    finally { setLoadingMenu(false); }
  };

  const generate = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res      = await fetch("/api/generate-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: info.name, cuisine: info.cuisine, topic: info.topic, context: info.context, tone }),
      });
      const { post } = await res.json();
      setGenerated(post);
      setStep(3);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const startOver = () => { setStep(1); setGenerated(null); setErrorMsg(""); };

  return (
    <ToolLayout
      title={t.social.title}
      subtitle={t.social.subtitle}
      tag={t.social.tag}
      showBanner={plan === "free"}
    >
      <StepIndicator
        steps={[...t.social.steps]}
        current={step}
        activePrimary={activePrimary}
        onStepClick={(n) => { if (n < step) setStep(n); }}
      />

      {step === 1 && (
        <StepPostInfo
          info={info}
          onChange={(field, val) => setInfo((i) => ({ ...i, [field]: val }))}
          onNext={() => setStep(2)}
          onLoadMenu={handleLoadMenu}
          loadingMenu={loadingMenu}
          isLoggedIn={!!user}
        />
      )}

      {step === 2 && (
        <StepPostType
          format={format} tone={tone} palette={palette}
          plan={plan} loading={loading} errorMsg={errorMsg}
          onSetFormat={setFormat} onSetTone={setTone} onSetPalette={setPalette}
          onUpgrade={handleUpgrade} onBack={() => setStep(1)} onGenerate={generate}
        />
      )}

      {step === 3 && generated && (
        <StepPostPreview
          post={generated}
          restaurantName={info.name}
          topic={info.topic}
          context={info.context}
          palette={palette}
          format={format}
          onStartOver={startOver}
        />
      )}
    </ToolLayout>
  );
}
