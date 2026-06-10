"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Lang } from "@/lib/i18n";

interface LangContextValue {
  lang:      Lang;
  t:         typeof translations.en;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Recupera el idioma guardado al montar
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "es") setLang(saved);
  }, []);

  const toggleLang = () => {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  return (
    <LangContext.Provider value={{ lang, t: translations[lang] as unknown as typeof translations.en, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be inside <LangProvider>");
  return ctx;
}
