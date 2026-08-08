import { tools } from "@/lib/tools";
import { ogImageMeta } from "@/lib/site";
import { getToolContent } from "@/lib/tool-content";
import { getHowToSteps } from "@/lib/how-to-steps";
import { getI18n } from "@/lib/tool-i18n";
import { dictionaries } from "./index";
import { alternateLinks, localeUrl } from "./seo";
import { LOCALE_META, type Locale } from "./types";

const titleOverrides: Record<string, string> = {
  "pdf-translator": "Translate a PDF Online Free — 15+ Languages, No Sign-Up",
};
const descriptionOverrides: Record<string, string> = {
  "pdf-translator":
    "Translate a PDF into English, Spanish, French, German, Portuguese, Arabic, Hindi, Urdu, Chinese and more. Free, no signup — your PDF stays in your browser.",
};

/** Locale templates used when a slug has no hand-written translation yet. */
const templates: Record<Locale, { title: (n: string) => string; desc: (d: string) => string }> = {
  en: {
    title: (n) => `${n} — Free Online Tool · EasyFileMagic`,
    desc: (d) => `${d} 100% free, runs in your browser, no signup.`,
  },
  fr: {
    title: (n) => `${n} — outil en ligne gratuit · EasyFileMagic`,
    desc: (d) => `${d} Gratuit, 100% dans votre navigateur, sans inscription.`,
  },
  es: {
    title: (n) => `${n} — herramienta online gratis · EasyFileMagic`,
    desc: (d) => `${d} Gratis, funciona en tu navegador, sin registro.`,
  },
  ar: {
    title: (n) => `${n} — أداة مجانية عبر الإنترنت · EasyFileMagic`,
    desc: (d) => `${d} مجاني بالكامل، يعمل داخل متصفحك بدون تسجيل.`,
  },
};

const ogLocale: Record<Locale, string> = { en: "en_US", fr: "fr_FR", es: "es_ES", ar: "ar_AR" };

/** Full head() payload for /tools/$slug in any locale (meta, hreflang, JSON-LD). */
export function toolHead(locale: Locale, slug: string) {
  const tool = tools.find((x) => x.slug === slug);
  const t = dictionaries[locale];
  const tpl = templates[locale];

  if (!tool) {
    return {
      meta: [
        { title: `${t.toolPage.notFoundTitle} · EasyFileMagic` },
        { name: "description", content: t.toolPage.notFoundBody },
        { name: "robots", content: "noindex" },
      ],
      links: [{ rel: "canonical", href: localeUrl(locale, `/tools/${slug}`) }],
      scripts: [],
    };
  }

  const localized = locale === "en" ? undefined : getI18n(tool.slug)?.[locale];
  const title =
    localized?.title ??
    (locale === "en" ? titleOverrides[tool.slug] : undefined) ??
    tpl.title(tool.name);
  const description =
    localized?.description ??
    (locale === "en" ? descriptionOverrides[tool.slug] : undefined) ??
    tpl.desc(tool.description);

  const url = localeUrl(locale, `/tools/${tool.slug}`);
  const content = getToolContent(tool.slug);
  const steps = getHowToSteps(tool.slug);

  const scripts: { type: string; children: string }[] = [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description,
        inLanguage: LOCALE_META[locale].tag,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (browser-based)",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        url,
      }),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.nav.home, item: localeUrl(locale, "/") },
          { "@type": "ListItem", position: 2, name: t.nav.tools, item: localeUrl(locale, "/#tools") },
          { "@type": "ListItem", position: 3, name: tool.name, item: url },
        ],
      }),
    },
  ];

  // Structured content stays English-only until translated copy exists per slug.
  if (locale === "en" && content.faqs && content.faqs.length > 0) {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    });
  }
  if (locale === "en" && steps && steps.length > 0) {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to use ${tool.name}`,
        description,
        totalTime: "PT2M",
        step: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
          url: `${url}#step-${i + 1}`,
        })),
      }),
    });
  }

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: ogLocale[locale] },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...ogImageMeta(undefined, `${tool.name} — free browser-based tool on EasyFileMagic`),
    ],
    links: alternateLinks(locale, `/tools/${tool.slug}`),
    scripts,
  };
}
