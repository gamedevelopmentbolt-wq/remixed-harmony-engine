import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { en } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";
import { es } from "./dictionaries/es";
import { ar } from "./dictionaries/ar";
import type { Dict } from "./dictionaries/en";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale, localePath, type Locale } from "./types";

export * from "./types";
export type { Dict };

export const dictionaries: Record<Locale, Dict> = { en, fr, es, ar };

export const LOCALE_STORAGE_KEY = "efm.locale";

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dict;
  /** Build a locale-aware href for a root-relative path. */
  path: (p?: string) => string;
}

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  dir: "ltr",
  t: en,
  path: (p = "/") => p,
});

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: LOCALE_META[locale].dir,
      t: dictionaries[locale],
      path: (p = "/") => localePath(locale, p),
    }),
    [locale],
  );

  // Keep <html lang/dir> in sync and persist the active locale.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", LOCALE_META[locale].tag);
    root.setAttribute("dir", LOCALE_META[locale].dir);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* storage unavailable */
    }
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Interpolate {placeholders} in a translated string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

/** Stored preference, else best match from navigator languages, else English. */
export function detectPreferredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of candidates) {
    const base = raw?.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

