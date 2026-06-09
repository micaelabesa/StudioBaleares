"use client";
import Link from "next/link";
import { T } from "@/lib/constants";
import { useLang } from "@/contexts/LangContext";

export function Footer() {
  const { t } = useLang();

  const links = [
    { href: "/studio/qrmenu",   label: t.nav.qrmenu   },
    { href: "/studio/social",   label: t.nav.social   },
    { href: "/studio/airbnb",   label: t.nav.airbnb   },
    { href: "/studio/branding", label: t.nav.branding },
  ];

  return (
    <footer style={{
      padding: "48px 60px",
      borderTop: `1px solid ${T.sandDark}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: 20,
    }}>
      <div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: T.ink }}>
          Studio Baleares
        </p>
        <p className="tag" style={{ marginTop: 3 }}>Mediterranean Studio · Hospitality &amp; Lifestyle</p>
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="nav-link" style={{ fontSize: 10 }}>
            {l.label}  {/* ← ahora usa t */}
          </Link>
        ))}
      </div>

      <p style={{ fontSize: 11, color: T.mist }}>{t.footer.rights}</p>
    </footer>
  );
}
