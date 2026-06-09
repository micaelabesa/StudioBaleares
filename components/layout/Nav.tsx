"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { useLang }   from "@/contexts/LangContext";

export function Nav() {
  const pathname                                        = usePathname();
  const router                                          = useRouter();
  const { plan, user, authLoading, handleUpgrade, signOut } = useStudio();
  const { lang, t, toggleLang }                         = useLang();
  const [scrolled, setScrolled]                         = useState(false);
  const [userMenu, setUserMenu]                         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (pathname === "/login") return null;

  const links = [
    { href: "/",                 label: t.nav.studio   },
    { href: "/studio/qrmenu",   label: t.nav.qrmenu   },
    { href: "/studio/social",   label: t.nav.social   },
    { href: "/studio/airbnb",   label: t.nav.airbnb   },
    { href: "/studio/branding", label: t.nav.branding },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 40px", height: 68,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(253,252,249,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.sandDark}` : "1px solid transparent",
      transition: "all 0.35s ease",
    }}>

      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
        <div style={{
          width: 26, height: 26,
          border: `1.5px solid ${T.terracotta}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(45deg)",
        }}>
          <div style={{ width: 8, height: 8, background: T.terracotta }} />
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: T.ink, letterSpacing: "0.05em" }}>
          Studio Baleares
        </span>
      </Link>

      {/* Links + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? " active" : ""}`}>
            {l.label}
          </Link>
        ))}

        <button className="live-badge" onClick={() => router.push("/preview")}>
          <span className="live-dot" />
          {t.nav.preview}
        </button>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          style={{
            fontSize: 10, fontWeight: 500, letterSpacing: "0.12em",
            color: T.mist, border: `1px solid ${T.sandDark}`,
            padding: "4px 10px", transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = T.ink; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = T.mist; }}
        >
          {lang === "en" ? "ES" : "EN"}
        </button>

        {/* Auth */}
        {!authLoading && (
          user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenu((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 11, color: T.inkLight, cursor: "pointer",
                  background: "none", border: `1px solid ${T.sandDark}`,
                  padding: "5px 12px", letterSpacing: "0.06em",
                }}
              >
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: T.terracotta, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: T.white, fontSize: 9, fontWeight: 600, flexShrink: 0,
                }}>
                  {user.email?.[0]?.toUpperCase()}
                </span>
                {plan === "pro" && (
                  <span style={{ color: T.terracotta, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em" }}>PRO</span>
                )}
                ▾
              </button>

              {userMenu && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: T.white, border: `1px solid ${T.sandDark}`,
                  minWidth: 200, zIndex: 50, padding: "8px 0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}>
                  <p style={{ padding: "10px 16px", fontSize: 11, color: T.mist, borderBottom: `1px solid ${T.sandDark}`, marginBottom: 4 }}>
                    {user.email}
                  </p>
                  {plan === "free" && (
                    <button
                      style={{ width: "100%", textAlign: "left", padding: "9px 16px", fontSize: 11, color: T.terracotta, letterSpacing: "0.08em" }}
                      onClick={() => { setUserMenu(false); handleUpgrade(); }}
                    >
                      ✦ {lang === "en" ? "Upgrade to Pro" : "Mejorar a Pro"}
                    </button>
                  )}
                  {plan === "pro" && (
                    <button
                      style={{ width: "100%", textAlign: "left", padding: "9px 16px", fontSize: 11, color: T.inkLight, letterSpacing: "0.08em" }}
                      onClick={() => { setUserMenu(false); router.push("/studio/subscription"); }}
                    >
                      {lang === "en" ? "Manage plan" : "Gestionar plan"}
                    </button>
                  )}
                  <button
                    style={{ width: "100%", textAlign: "left", padding: "9px 16px", fontSize: 11, color: T.inkLight, letterSpacing: "0.08em" }}
                    onClick={async () => { setUserMenu(false); await signOut(); router.push("/"); }}
                  >
                    {t.nav.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-primary" style={{ padding: "7px 18px", fontSize: 10 }} onClick={() => router.push("/login")}>
              {t.nav.signIn}
            </button>
          )
        )}
      </div>
    </nav>
  );
}
