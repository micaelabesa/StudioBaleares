"use client";

interface LogoProps {
  variant?: "nav" | "hero";
}

export default function Logo({ variant = "hero" }: LogoProps) {
  if (variant === "nav") {
    return (
      <div className="flex flex-col items-start justify-center" style={{ lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 15,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink)",
            fontWeight: 400,
          }}
        >
          Studio Baleares
        </span>
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 8,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--mist)",
            marginTop: 4,
            fontWeight: 300,
          }}
        >
          Digital Assets · 2026
        </span>
      </div>
    );
  }

  // hero variant — centered, larger
  return (
    <div className="flex flex-col items-center justify-center">
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(22px, 3vw, 30px)",
          fontWeight: 400,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--ink)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        Studio Baleares
      </h2>
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 9,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "var(--mist)",
          margin: "6px 0 0",
          fontWeight: 300,
        }}
      >
        Digital Assets · Est. 2026
      </p>
    </div>
  );
}
