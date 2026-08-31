"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "en" | "bn";

const STORAGE_KEY = "np-lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Pick a string for the active language. `t("Pricing", "দাম")` */
  t: <T, U = T>(en: T, bn?: U) => T | U;
};

const LanguageContext = createContext<Ctx | null>(null);

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

let cachedLang: Lang = "en";

function getSnapshot(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "bn" || saved === "en") {
      cachedLang = saved;
      return saved;
    }
    if (navigator.language?.toLowerCase().startsWith("bn")) {
      cachedLang = "bn";
      return "bn";
    }
  } catch {
    /* fallback to en */
  }
  return cachedLang;
}

function getServerSnapshot(): Lang {
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep <html lang> and the Bangla font class in sync.
  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.classList.toggle("lang-bn", lang === "bn");
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    try {
      cachedLang = l;
      localStorage.setItem(STORAGE_KEY, l);
      listeners.forEach((listener) => listener());
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: <T, U = T>(en: T, bn?: U): T | U =>
        lang === "bn" && bn !== undefined ? bn : en,
    }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Lets a component render outside the provider (e.g. in isolation) without crashing.
    return { lang: "en", setLang: () => {}, t: ((en) => en) as Ctx["t"] };
  }
  return ctx;
}
