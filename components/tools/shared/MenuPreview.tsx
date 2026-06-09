import { T } from "@/lib/constants";
import type { GeneratedMenu } from "@/lib/types";

interface MenuPreviewProps {
  menu: GeneratedMenu;
  primaryColor: string;
  bgColor: string;
  watermark?: boolean;
}

export function MenuPreview({ menu, primaryColor, bgColor, watermark = false }: MenuPreviewProps) {
  return (
    <div style={{ background: bgColor, border: `1px solid ${T.sandDark}`, padding: "52px 44px", position: "relative" }}>
      {/* Free watermark */}
      {watermark && (
        <div style={{
          position: "absolute", bottom: 16, right: 16,
          fontSize: 9, color: T.mist, letterSpacing: "0.12em",
          textTransform: "uppercase", opacity: 0.5,
        }}>
          studiobaleares.com
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40, paddingBottom: 40, borderBottom: `1px solid ${T.sandDark}` }}>
        <div style={{
          width: 32, height: 32, border: `1.5px solid ${primaryColor}`,
          margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(45deg)",
        }}>
          <div style={{ width: 9, height: 9, background: primaryColor }} />
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 400, color: T.ink }}>
          {menu.restaurantName}
        </h1>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, marginTop: 8, fontSize: 16 }}>
          {menu.tagline}
        </p>
        <div style={{ width: 36, height: 1, background: primaryColor, margin: "22px auto 0" }} />
      </div>

      {/* Categories */}
      {menu.categories.map((cat, ci) => (
        <div key={ci} style={{
          marginBottom: 28, paddingBottom: 28,
          borderBottom: ci < menu.categories.length - 1 ? `1px solid ${T.sandDark}` : "none",
        }}>
          <h2 style={{
            fontSize: 10, fontWeight: 500, letterSpacing: "0.18em",
            textTransform: "uppercase", color: primaryColor, marginBottom: 16,
          }}>
            {cat.category}
          </h2>
          {cat.items.map((item, ii) => (
            <div key={ii} className="menu-row">
              <div style={{ flex: 1, paddingRight: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 3 }}>{item.name}</p>
                {item.desc && (
                  <p className="serif" style={{ fontSize: 12, color: T.mist, fontStyle: "italic" }}>{item.desc}</p>
                )}
              </div>
              <p style={{ fontSize: 13, fontWeight: 500, color: primaryColor, whiteSpace: "nowrap" }}>{item.price}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
