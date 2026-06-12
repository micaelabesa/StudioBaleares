"use client";
import Link from "next/link";
import { T } from "@/lib/constants";
import { useLang } from "@/contexts/LangContext";
import Logo from "@/components/ui/Logo";

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
      padding: "28px 40px",
      borderTop: `1px solid ${T.sandDark}`,
      background: T.white,
    }}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo variant="nav" />
        </Link>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" style={{ fontSize: 10 }}>
              {l.label}
            </Link>
          ))}
        </div>

        <p style={{ fontSize: 10, color: T.mist, letterSpacing: "0.08em" }}>{t.footer.rights}</p>
      </div>
    </footer>
  );
}
