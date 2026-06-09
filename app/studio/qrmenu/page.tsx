"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { T, PALETTES } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { StepIndicator } from "@/components/tools/shared/StepIndicator";
import { StepRestaurant } from "@/components/tools/qrmenu/StepRestaurant";
import { StepMenuItems } from "@/components/tools/qrmenu/StepMenuItems";
import { StepStyle } from "@/components/tools/qrmenu/StepStyle";
import { StepPreview } from "@/components/tools/qrmenu/StepPreview";
import type { MenuCategory, MenuItem, GeneratedMenu } from "@/lib/types";
import { useLang } from "@/contexts/LangContext";

export default function QRMenuPage() {
  const { plan, handleUpgrade } = useStudio();
  const { t } = useLang();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [generated, setGenerated] = useState<GeneratedMenu | null>(null);
  const [menuId, setMenuId]       = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [exported, setExported]   = useState(false);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [info, setInfo] = useState({ name: "", tagline: "", cuisine: "" });
  const [palette, setPalette] = useState("terracotta");
  const [categories, setCategories] = useState<MenuCategory[]>([
    { category: "Starters", items: [{ name: "", desc: "", price: "" }] },
  ]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const pal           = PALETTES[palette];
  const activePrimary = pal?.primary ?? "#C4693A";
  const activeBg      = pal?.bg      ?? "#FAF7F2";
  const hasItems      = categories.some((c) => c.items.some((i) => i.name.trim()));

  // ── Category / item helpers ──────────────────────────────────────────────────
  const addCategory = () =>
    setCategories((cs) => [...cs, { category: "New Section", items: [{ name: "", desc: "", price: "" }] }]);

  const updateCategoryName = (ci: number, val: string) =>
    setCategories((cs) => cs.map((c, i) => i === ci ? { ...c, category: val } : c));

  const addItem = (ci: number) =>
    setCategories((cs) => cs.map((c, i) =>
      i === ci ? { ...c, items: [...c.items, { name: "", desc: "", price: "" }] } : c));

  const removeItem = (ci: number, ii: number) =>
    setCategories((cs) => cs.map((c, i) =>
      i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c));

  const updateItem = (ci: number, ii: number, field: keyof MenuItem, val: string) =>
    setCategories((cs) => cs.map((c, i) =>
      i === ci ? { ...c, items: c.items.map((item, j) => j === ii ? { ...item, [field]: val } : item) } : c));

  // ── Generate: calls API route (Claude server-side) + saves to Supabase ──────
  const generate = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ info, categories, palette }),
      });

      const { menu, id, error: apiError } = await res.json();

      if (apiError) setErrorMsg("Menu saved locally — database unavailable.");

      setGenerated(menu);
      setMenuId(id);

      // ── Real QR code pointing to /menu/[id] ─────────────────────────────────
      if (id) {
        const menuUrl = `${window.location.origin}/menu/${id}`;
        const qr = await QRCode.toDataURL(menuUrl, {
          width: 200,
          margin: 1,
          errorCorrectionLevel: "M",
          color: {
            dark:  activePrimary,
            light: "#FFFFFF",
          },
        });
        setQrDataUrl(qr);
      } else {
        // Fallback: QR encodes a helpful message if Supabase failed
        const qr = await QRCode.toDataURL(`Menu for ${info.name}`, {
          width: 200,
          margin: 1,
          color: { dark: activePrimary, light: "#FFFFFF" },
        });
        setQrDataUrl(qr);
      }

    } catch {
      // Full fallback if API route itself fails
      setGenerated({
        restaurantName: info.name,
        tagline: info.tagline || "Flavors kissed by the Mediterranean sun",
        categories,
      });
      setErrorMsg("Something went wrong — showing your original content.");
    }

    setLoading(false);
    setStep(4);
  };

  // ── Export QR ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!qrDataUrl) return;
    if (plan === "free") {
      const res  = await fetch("/api/export/use", { method: "POST" });
      const body = await res.json();
      if (!body.allowed) { handleUpgrade(); return; }
    }
    const a    = document.createElement("a");
    a.href     = qrDataUrl;
    a.download = `${info.name.replace(/\s+/g, "-")}-qr.png`;
    a.click();
    setExported(true);
  };

  const startOver = () => {
    setStep(1); setGenerated(null); setQrDataUrl(null);
    setMenuId(null); setExported(false); setErrorMsg("");
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ToolLayout
      title={t.qr.title}
      subtitle={t.qr.subtitle}
      tag={t.qr.tag}
      showBanner={plan === "free"}
    >
      <StepIndicator
        steps={[...t.qr.steps]}
        current={step}
        activePrimary={activePrimary}
        onStepClick={setStep}
      />

      {step === 1 && (
        <StepRestaurant
          info={info}
          onChange={(field, val) => setInfo((i) => ({ ...i, [field]: val }))}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepMenuItems
          categories={categories}
          activePrimary={activePrimary}
          onAddCategory={addCategory}
          onUpdateCategoryName={updateCategoryName}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onUpdateItem={updateItem}
          hasItems={hasItems}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <StepStyle
          palette={palette}
          plan={plan}
          loading={loading}
          errorMsg={errorMsg}
          onSelectPalette={setPalette}
          onUpgrade={handleUpgrade}
          onBack={() => setStep(2)}
          onGenerate={generate}
        />
      )}

      {step === 4 && generated && (
        <StepPreview
          generated={generated}
          qrDataUrl={qrDataUrl}
          activePrimary={activePrimary}
          activeBg={activeBg}
          exported={exported}
          onExport={handleExport}
          onStartOver={startOver}
        />
      )}

      {/* Menu link — shown in step 4 when saved */}
      {step === 4 && menuId && (
        <div style={{
          marginTop: 24, padding: "14px 20px",
          background: T.cream, border: `1px solid ${T.sandDark}`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span className="tag">Public link</span>
          <a
            href={`/menu/${menuId}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: T.terracotta, textDecoration: "underline" }}
          >
            {window.location.origin}/menu/{menuId}
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
