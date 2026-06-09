"use client";

import Link from "next/link";
import { T } from "@/lib/constants";
import { Ornament } from "@/components/ui/Ornament";
import { useLang } from "@/contexts/LangContext";
import { MenuPreview } from "@/components/tools/shared/MenuPreview";
import type { GeneratedMenu } from "@/lib/types";

const DEMO: GeneratedMenu = {
  restaurantName: "Casa Marina",
  tagline: "Flavors kissed by the Mediterranean sun",
  categories: [
    {
      category: "Entrantes",
      items: [
        { name: "Pan con Tomate",     desc: "Grilled sourdough with sun-ripened tomato, sea salt and extra-virgin olive oil", price: "€6"  },
        { name: "Pulpo a la Gallega", desc: "Tender octopus with smoked paprika, olive oil and fleur de sel",                  price: "€18" },
      ],
    },
    {
      category: "Del Mar",
      items: [
        { name: "Lubina a la Plancha", desc: "Grilled sea bass with herb-infused olive oil and lemon confit",  price: "€26" },
        { name: "Fideuà de Mariscos",  desc: "Traditional noodle paella with prawns, squid and saffron",       price: "€24" },
      ],
    },
    {
      category: "Postres",
      items: [
        { name: "Crema Catalana",    desc: "Classic custard with caramelised crust and orange blossom water",   price: "€8" },
        { name: "Tarta de Almendra", desc: "Almond cake with citrus glaze, served with mascarpone cream",        price: "€9" },
      ],
    },
  ],
};

export default function PreviewPage() {
  const { t } = useLang();
  return (
    <div style={{ paddingTop: 68 }}>
      {/* Header */}
      <div style={{
        padding: "52px 60px 40px",
        background: T.sand, borderBottom: `1px solid ${T.sandDark}`,
        textAlign: "center",
      }}>
        <p className="tag">{t.preview.tag}</p>
        <Ornament />
        <h1 style={{ fontSize: 36 }}>Casa Marina</h1>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 17 }}>
          {t.preview.subtitle}
        </p>
        <Link href="/studio/qrmenu">
          <button className="btn-primary" style={{ marginTop: 24 }}>
            {t.preview.cta}
          </button>
        </Link>
      </div>

      {/* Menu */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "68px 40px" }}>
        <MenuPreview
          menu={DEMO}
          primaryColor="#C4693A"
          bgColor="#FFFFFF"
          watermark={false}
        />

        <div style={{ textAlign: "center", marginTop: 52 }}>
          <p className="tag" style={{ marginBottom: 12 }}>{t.preview.guestTag}</p>
          <p style={{ color: T.mist, fontSize: 14, maxWidth: 360, margin: "0 auto 28px" }}>
            {t.preview.desc}
          </p>
          <Link href="/studio/qrmenu">
            <button className="btn-primary">{t.preview.ctaFree}</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
