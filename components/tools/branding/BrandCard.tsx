"use client";

import { forwardRef } from "react";
import type { BrandKit } from "@/app/api/generate-branding/route";

interface Props {
  kit:            BrandKit;
  venueName:      string;
  showWatermark?: boolean;
}

export const BrandCard = forwardRef<HTMLDivElement, Props>(
  function BrandCard({ kit, venueName, showWatermark = false }, ref) {
    const primary   = kit.colors.find(c => c.role === "primary")?.hex   ?? "#C4693A";
    const neutral   = kit.colors.find(c => c.role === "neutral")?.hex   ?? "#1A1A18";

    const headingFont = `'${kit.fonts.heading}', serif`;
    const bodyFont    = `'${kit.fonts.body}', sans-serif`;

    const labelStyle = {
      fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" as const,
      color: neutral, opacity: 0.4, fontFamily: bodyFont, margin: "0 0 16px",
    };

    const divider = <div style={{ height: 1, background: `${neutral}18`, margin: "40px 0" }} />;

    return (
      <div
        ref={ref}
        style={{
          width: 680, background: "#FDFCF9",
          fontFamily: bodyFont, position: "relative", overflow: "hidden",
        }}
      >
        {/* Top colour bar */}
        <div style={{ height: 5, display: "flex" }}>
          {kit.colors.map(c => (
            <div key={c.role} style={{ flex: 1, background: c.hex }} />
          ))}
        </div>

        <div style={{ padding: "52px 56px 48px" }}>

          {/* Header: logo mark + name + tagline */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 44 }}>
            <svg width={60} height={60} viewBox="0 0 60 60" style={{ flexShrink: 0 }}>
              <rect
                x={30} y={4} width={36} height={36}
                transform="rotate(45 30 30)"
                fill="none" stroke={primary} strokeWidth={1.5}
              />
              <text
                x={30} y={35} textAnchor="middle"
                fontSize={20} fontFamily={headingFont} fill={primary}
              >
                {kit.logoInitials}
              </text>
            </svg>
            <div>
              <p style={{
                fontFamily: headingFont, fontSize: 30, fontWeight: 400,
                color: neutral, margin: "0 0 8px", letterSpacing: "0.02em", lineHeight: 1.15,
              }}>
                {venueName}
              </p>
              <p style={{
                fontFamily: bodyFont, fontSize: 11, color: primary,
                letterSpacing: "0.18em", textTransform: "uppercase", margin: 0,
              }}>
                {kit.tagline}
              </p>
            </div>
          </div>

          {divider}

          {/* Colour palette */}
          <div style={{ marginBottom: 0 }}>
            <p style={labelStyle}>Colour Palette · {kit.paletteName}</p>
            <div style={{ display: "flex", gap: 12 }}>
              {kit.colors.map(c => (
                <div key={c.role} style={{ flex: 1 }}>
                  <div style={{ height: 68, background: c.hex, marginBottom: 10 }} />
                  <p style={{ fontSize: 11, color: neutral, fontFamily: bodyFont, margin: "0 0 3px", fontWeight: 500 }}>
                    {c.name}
                  </p>
                  <p style={{ fontSize: 10, color: neutral, opacity: 0.4, fontFamily: "'Courier New', monospace", margin: 0 }}>
                    {c.hex}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {divider}

          {/* Typography */}
          <div>
            <p style={labelStyle}>Typography</p>
            <div style={{ display: "flex", gap: 40 }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 9, color: primary, letterSpacing: "0.14em",
                  textTransform: "uppercase", fontFamily: bodyFont, margin: "0 0 10px",
                }}>
                  Heading · {kit.fonts.heading}
                </p>
                <p style={{ fontFamily: headingFont, fontSize: 26, color: neutral, margin: 0, lineHeight: 1.3 }}>
                  {venueName}
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 9, color: primary, letterSpacing: "0.14em",
                  textTransform: "uppercase", fontFamily: bodyFont, margin: "0 0 10px",
                }}>
                  Body · {kit.fonts.body}
                </p>
                <p style={{
                  fontFamily: bodyFont, fontSize: 13,
                  color: neutral, opacity: 0.7, margin: 0, lineHeight: 1.8,
                }}>
                  The art of hospitality, expressed<br />in every thoughtful detail.
                </p>
              </div>
            </div>
          </div>

          {divider}

          {/* Brand personality */}
          <div>
            <p style={labelStyle}>Brand Personality</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {kit.descriptors.map(d => (
                <span key={d} style={{
                  padding: "6px 14px",
                  border: `1px solid ${primary}50`,
                  fontSize: 10, color: primary,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: bodyFont,
                }}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 40, paddingTop: 24,
            borderTop: `1px solid ${neutral}18`,
          }}>
            <p style={{ fontSize: 9, color: neutral, opacity: 0.25, fontFamily: bodyFont, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
              Generated by Studio Baleares
            </p>
            <p style={{ fontSize: 9, color: neutral, opacity: 0.25, fontFamily: bodyFont, margin: 0 }}>
              studiobaleares.com
            </p>
          </div>
        </div>

        {/* Watermark */}
        {showWatermark && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <p style={{
              fontSize: 13, color: neutral, opacity: 0.06,
              fontFamily: bodyFont, letterSpacing: "0.22em", textTransform: "uppercase",
              transform: "rotate(-35deg)", whiteSpace: "nowrap", userSelect: "none", margin: 0,
            }}>
              STUDIO BALEARES · STUDIO BALEARES · STUDIO BALEARES ·
            </p>
          </div>
        )}
      </div>
    );
  }
);
