import { T } from "@/lib/constants";

export function ProBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: T.terracotta, color: T.white,
      fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
      textTransform: "uppercase", padding: "2px 8px",
      verticalAlign: "middle", marginLeft: 8,
    }}>
      PRO
    </span>
  );
}
