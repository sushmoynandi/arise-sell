"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "bn";

const STORAGE_KEY = "np-lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Pick a string for the active language. `t("Pricing", "দাম")` */
  t: <T>(en: T, bn: T) => T;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore the visitor's choice. Runs after hydration so server and client
  // markup match on the first paint.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "bn" || saved === "en") {
        setLangState(saved);
        return;
      }
      // No stored choice: default to Bangla for visitors whose browser prefers it.
      if (navigator.language?.toLowerCase().startsWith("bn")) setLangState("bn");
    } catch {
      /* storage unavailable — stay on English */
    }
  }, []);

  // Keep <html lang> and the Bangla font class in sync.
  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.classList.toggle("lang-bn", lang === "bn");
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: <T,>(en: T, bn: T) => (lang === "bn" ? bn : en),
    }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Lets a component render outside the provider (e.g. in isolation) without crashing.
    return { lang: "en", setLang: () => {}, t: (en) => en };
  }
  return ctx;
}
