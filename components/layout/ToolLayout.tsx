import { ReactNode } from "react";
import { T } from "@/lib/constants";
import { Ornament } from "@/components/ui/Ornament";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";

interface ToolLayoutProps {
  title: string;
  subtitle: string;
  tag: string;
  showBanner?: boolean; // passed as prop so server pages can decide
  children: ReactNode;
}

// Note: UpgradeBanner reads plan from context internally.
// Pass showBanner={plan === "free"} from the page.
export function ToolLayout({ title, subtitle, tag, showBanner = false, children }: ToolLayoutProps) {
  return (
    <div style={{ paddingTop: 68, minHeight: "100vh" }}>
      <div style={{
        padding: "56px 60px 44px",
        background: T.sand,
        borderBottom: `1px solid ${T.sandDark}`,
      }}>
        <p className="tag">{tag}</p>
        <Ornament />
        <h1 style={{ fontSize: 40, color: T.ink, marginBottom: 10 }}>{title}</h1>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 17 }}>{subtitle}</p>
      </div>

      <div style={{ padding: "48px 60px", maxWidth: 1160, margin: "0 auto" }}>
        {showBanner && <UpgradeBanner />}
        {children}
      </div>
    </div>
  );
}
