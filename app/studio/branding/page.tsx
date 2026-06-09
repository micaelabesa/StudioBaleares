"use client";

import { ComingSoon } from "@/components/tools/shared/ComingSoon";
import { useLang } from "@/contexts/LangContext";

export default function BrandingPage() {
  const { t } = useLang();
  return (
    <ComingSoon
      title={t.branding.title}
      subtitle={t.branding.subtitle}
      tag={t.branding.tag}
      features={[...t.branding.features]}
    />
  );
}
