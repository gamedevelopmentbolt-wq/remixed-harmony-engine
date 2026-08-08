export const LOCALES = ["en", "fr", "es", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export interface LocaleMeta {
  code: Locale;
  /** BCP-47 tag used for <html lang> and hreflang */
  tag: string;
  label: string;
  englishLabel: string;
  dir: "ltr" | "rtl";
  flag: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: "en", tag: "en", label: "English", englishLabel: "English", dir: "ltr", flag: "EN" },
  fr: { code: "fr", tag: "fr", label: "Français", englishLabel: "French", dir: "ltr", flag: "FR" },
  es: { code: "es", tag: "es", label: "Español", englishLabel: "Spanish", dir: "ltr", flag: "ES" },
  ar: { code: "ar", tag: "ar", label: "العربية", englishLabel: "Arabic", dir: "rtl", flag: "AR" },
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

/** Prefix a root-relative path with the locale segment (English stays unprefixed). */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
