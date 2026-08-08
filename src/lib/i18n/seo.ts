import { SITE_URL, ogImageMeta } from "@/lib/site";
import { tools } from "@/lib/tools";
import { dictionaries, fmt } from "./index";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePath, type Locale } from "./types";

export interface HeadLink {
  rel: string;
  href: string;
  hrefLang?: string;
}

/** Absolute URL for a path in a given locale. */
export function localeUrl(locale: Locale, path = "/"): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** canonical (self) + hreflang alternates for every locale + x-default. */
export function alternateLinks(locale: Locale, path = "/"): HeadLink[] {
  const links: HeadLink[] = [{ rel: "canonical", href: localeUrl(locale, path) }];
  for (const l of LOCALES) {
    links.push({ rel: "alternate", href: localeUrl(l, path), hrefLang: LOCALE_META[l].tag });
  }
  links.push({ rel: "alternate", href: localeUrl(DEFAULT_LOCALE, path), hrefLang: "x-default" });
  return links;
}

/** Live tool count, rounded down to the nearest ten — keeps "100+" style titles accurate. */
function toolCountBucket(): number {
  return Math.max(10, Math.floor(tools.length / 10) * 10);
}

/** Per-locale title/description/OG meta for the home page. */
export function homeMeta(locale: Locale) {
  const m = dictionaries[locale].meta;
  const count = toolCountBucket();
  const title = fmt(m.title, { count });
  const ogTitle = fmt(m.ogTitle, { count });
  return [
    { title },
    { name: "description", content: m.description },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: m.ogDescription },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: locale === "en" ? "en_US" : locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : "ar_AR" },
    { property: "og:url", content: localeUrl(locale, "/") },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: m.ogDescription },
    ...ogImageMeta(),
  ];
}
