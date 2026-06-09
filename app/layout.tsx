import type { Metadata } from "next";
import "./globals.css";
import { StudioProvider } from "@/contexts/StudioContext";
import { LangProvider }   from "@/contexts/LangContext";
import { Nav }            from "@/components/layout/Nav";
import { Footer }         from "@/components/layout/Footer";
import { UpgradeModal }   from "@/components/ui/UpgradeModal";

export const metadata: Metadata = {
  title: "Studio Baleares | Premium Digital Assets",
  description: "QR menus, social posts, welcome guides and branding kits for restaurants, cafés and Airbnb hosts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <LangProvider>
          <StudioProvider>
            <Nav />
            <main>{children}</main>
            <Footer />
            <UpgradeModal />
          </StudioProvider>
        </LangProvider>
      </body>
    </html>
  );
}
