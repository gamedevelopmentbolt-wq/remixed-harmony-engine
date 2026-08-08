import { dictionaries } from "./index";
import { alternateLinks, homeMeta } from "./seo";
import type { Locale } from "./types";

/** Full head() payload (meta + hreflang links + FAQ JSON-LD) for the home page in one locale. */
export function homeHead(locale: Locale) {
  const t = dictionaries[locale];
  return {
    meta: homeMeta(locale),
    links: alternateLinks(locale, "/"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: locale,
          mainEntity: t.faq.items.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  };
}
