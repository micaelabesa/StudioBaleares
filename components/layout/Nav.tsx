"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { useStudio } from "@/contexts/StudioContext";
import { useLang }   from "@/contexts/LangContext";
import Logo          from "@/components/ui/Logo";

export function Nav() {
  const pathname                                             = usePathname();
  const router                                               = useRouter();
  const { plan, user, authLoading, handleUpgrade, signOut }  = useStudio();
  const { lang, t, toggleLang }                              = useLang();
  const [scrolled,    setScrolled]    = useState(false);
  const [userMenu,    setUserMenu]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setUserMenu(false); }, [pathname]);

  if (pathname === "/login") return null;

  const links = [
    { href: "/studio/qrmenu",   label: t.nav.qrmenu   },
    { href: "/studio/social",   label: t.nav.social   },
    { href: "/studio/airbnb",   label: t.nav.airbnb   },
    { href: "/studio/branding", label: t.nav.branding },
  ];

  const navBg = scrolled || mobileOpen
    ? "rgba(253,252,249,0.98)"
    : "transparent";
  const navBorder = scrolled || mobileOpen
    ? `1px solid ${T.sandDark}`
    : "1px solid transparent";

  /* ── shared dropdown item style ── */
  const dropItem: React.CSSProperties = {
    width: "100%", textAlign: "left", padding: "9px 16px",
    fontSize: 11, color: T.inkLight, letterSpacing: "0.08em",
    background: "none", border: "none", cursor: "pointer",
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 32px", height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navBg,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: navBorder,
        transition: "background 0.35s ease, border-color 0.35s ease",
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo variant="nav" />
        </Link>

        {/* ── Desktop links (hidden on mobile) ── */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 24 }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`nav-link${pathname === l.href ? " active" : ""}`}>
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
              padding: "4px 10px", transition: "color 0.2s",
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
                      <button style={{ ...dropItem, color: T.terracotta }}
                        onClick={() => { setUserMenu(false); handleUpgrade(); }}>
                        ✦ {lang === "en" ? "Upgrade to Pro" : "Mejorar a Pro"}
                      </button>
                    )}
                    <button style={dropItem}
                      onClick={() => { setUserMenu(false); router.push("/studio/subscription"); }}>
                      {t.nav.account}
                    </button>
                    <button
                      style={{ ...dropItem, borderTop: `1px solid ${T.sandDark}`, marginTop: 4 }}
                      onClick={async () => { setUserMenu(false); await signOut(); router.push("/"); }}>
                      {t.nav.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-primary" style={{ padding: "7px 18px", fontSize: 10 }}
                onClick={() => router.push("/login")}>
                {t.nav.signIn}
              </button>
            )
          )}
        </div>

        {/* ── Mobile right: lang + hamburger ── */}
        <div className="flex md:hidden" style={{ alignItems: "center", gap: 14 }}>
          <button
            onClick={toggleLang}
            style={{
              fontSize: 10, fontWeight: 500, letterSpacing: "0.12em",
              color: T.mist, border: `1px solid ${T.sandDark}`,
              padding: "4px 10px",
            }}
          >
            {lang === "en" ? "ES" : "EN"}
          </button>

          <button
            onClick={() => { setMobileOpen((v) => !v); setUserMenu(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: T.ink }}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {mobileOpen ? (
                <>
                  <path d="M5 5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M17 5L5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <path d="M3 7H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3 15H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          className="flex md:hidden"
          style={{
            position: "fixed", top: 68, left: 0, right: 0, bottom: 0,
            background: T.white, zIndex: 99,
            flexDirection: "column", overflowY: "auto",
            borderTop: `1px solid ${T.sandDark}`,
          }}
        >
          {/* Nav links */}
          <div style={{ padding: "8px 0", borderBottom: `1px solid ${T.sandDark}` }}>
            {links.map((l) => (
              <Link
                key={l.href} href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block", padding: "14px 32px",
                  fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: pathname === l.href ? T.terracotta : T.inkLight,
                  textDecoration: "none",
                  borderLeft: pathname === l.href ? `2px solid ${T.terracotta}` : "2px solid transparent",
                }}
              >
                {l.label}
              </Link>
            ))}
            <button
              className="live-badge"
              style={{ margin: "12px 32px", display: "inline-flex" }}
              onClick={() => { setMobileOpen(false); router.push("/preview"); }}
            >
              <span className="live-dot" />
              {t.nav.preview}
            </button>
          </div>

          {/* Auth section */}
          <div style={{ padding: "20px 32px", marginTop: "auto" }}>
            {!authLoading && (
              user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ fontSize: 11, color: T.mist, marginBottom: 12 }}>{user.email}</p>
                  {plan === "free" && (
                    <button
                      style={{ ...dropItem, padding: "11px 0", color: T.terracotta }}
                      onClick={() => { setMobileOpen(false); handleUpgrade(); }}
                    >
                      ✦ {lang === "en" ? "Upgrade to Pro" : "Mejorar a Pro"}
                    </button>
                  )}
                  <button
                    style={{ ...dropItem, padding: "11px 0" }}
                    onClick={() => { setMobileOpen(false); router.push("/studio/subscription"); }}
                  >
                    {t.nav.account}
                  </button>
                  <button
                    style={{ ...dropItem, padding: "11px 0", borderTop: `1px solid ${T.sandDark}`, marginTop: 8 }}
                    onClick={async () => { setMobileOpen(false); await signOut(); router.push("/"); }}
                  >
                    {t.nav.signOut}
                  </button>
                </div>
              ) : (
                <button className="btn-primary" style={{ width: "100%" }}
                  onClick={() => { setMobileOpen(false); router.push("/login"); }}>
                  {t.nav.signIn}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
