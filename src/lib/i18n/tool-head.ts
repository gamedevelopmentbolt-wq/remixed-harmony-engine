import { tools } from "@/lib/tools";
import { ogImageMeta } from "@/lib/site";
import { getToolContent } from "@/lib/tool-content";
import { getHowToSteps } from "@/lib/how-to-steps";
import { getI18n } from "@/lib/tool-i18n";
import { dictionaries } from "./index";
import { alternateLinks, localeUrl } from "./seo";
import { LOCALE_META, type Locale } from "./types";

/**
 * Hand-written, keyword-led English titles/descriptions for the highest-intent
 * tools. Anything not listed falls back to the locale template below, which is
 * still unique per tool because it interpolates the tool's own name/description.
 */
const titleOverrides: Record<string, string> = {
  "pdf-translator": "Translate a PDF Online Free — 15+ Languages, No Sign-Up",
  "merge-pdf": "Merge PDF Files Online Free — Combine PDFs, No Signup",
  "pdf-editor": "Free PDF Editor Online — Edit Text, Images & Sign, No Signup",
  "split-pdf": "Split PDF Online Free — Extract or Separate Pages Instantly",
  "compress-pdf": "Compress PDF Online Free — Reduce PDF File Size, No Limits",
  "pdf-to-jpg": "PDF to JPG Converter Free — Convert PDF Pages to Images",
  "image-to-pdf": "Image to PDF Converter Free — JPG & PNG to PDF Online",
  "compress-image": "Compress Image Online Free — Shrink JPG & PNG, Keep Quality",
  "image-converter": "Image Converter Free — JPG, PNG & WebP in Your Browser",
  "qr-code-generator": "Free QR Code Generator — Create & Download QR Codes, No Signup",
  "csv-json": "CSV to JSON Converter Free — Convert JSON to CSV Online",
  "zip-files": "Zip Files Online Free — Create a .zip Archive in Your Browser",
  ocr: "Free OCR Online — Extract Text from Images & Scanned PDFs",
  "pdf-word": "PDF to Word Converter Free — Convert PDF & Word, No Signup",
  "remove-background": "Remove Image Background Free — Transparent PNG in Seconds",
  "sign-pdf": "Sign a PDF Online Free — Draw or Type Your Signature",
  "protect-pdf": "Password Protect a PDF Free — Lock or Unlock PDF Online",
  "media-convert": "Free Audio & Video Converter — MP4, WebM, MP3 & WAV Online",
  "watermark-pdf": "Add a Watermark to a PDF Free — Text or Image, Every Page",
  "barcode-generator": "Free Barcode Generator — CODE128, EAN, UPC & ITF as PNG/SVG",
};
const descriptionOverrides: Record<string, string> = {
  "pdf-translator":
    "Translate a PDF into English, Spanish, French, German, Portuguese, Arabic, Hindi, Urdu, Chinese and more. Free, no signup — your PDF stays in your browser.",
  "merge-pdf":
    "Combine multiple PDF files into a single document in the order you choose. Free, unlimited and no signup — merging happens in your browser, so files are never uploaded.",
  "pdf-editor":
    "Edit any PDF free: add text, images, highlights, drawings, shapes and signatures, then download. No account, no watermark, and the file never leaves your browser.",
  "split-pdf":
    "Split a PDF into single-page files or extract just the pages you need, delivered as a ZIP. Free with no page limit and no signup, processed entirely in your browser.",
  "compress-pdf":
    "Reduce PDF file size so it fits an email or upload limit, without wrecking the text. Free, no daily cap and no signup — compression runs locally in your browser.",
  "pdf-to-jpg":
    "Convert every page of a PDF into high-quality JPG images and download them at once. Free, no watermark and no signup — conversion happens in your browser.",
  "image-to-pdf":
    "Combine JPG, PNG or WebP photos into one PDF in the order you choose. Free and unlimited with no signup, and your images are never uploaded to a server.",
  "compress-image":
    "Shrink JPG and PNG files for faster pages and smaller uploads while keeping them sharp. Free, no signup, and every image is compressed inside your browser.",
  "image-converter":
    "Convert images between JPG, PNG and WebP in a couple of clicks, in batches. Free with no watermark or signup — conversion runs locally in your browser.",
  "qr-code-generator":
    "Create a QR code from any link or text and download it as a crisp PNG or SVG. Free forever, no signup, no tracking redirect — the code is generated in your browser.",
  "csv-json":
    "Convert CSV to JSON or JSON back to CSV, with headers and nested rows handled for you. Free, no signup, and your data is parsed in your browser instead of uploaded.",
  "zip-files":
    "Bundle any number of files into a single .zip archive you can email or upload. Free with no size cap beyond your device's memory, and nothing is sent to a server.",
  ocr: "Extract real, selectable text from photos, screenshots and scanned PDFs with free OCR. Runs in your browser after a one-time model download — no signup, no uploads.",
  "pdf-word":
    "Convert a PDF into an editable Word document, or turn a Word file into a PDF. Free with no signup or watermark, and your document stays inside your browser.",
  "remove-background":
    "Cut the subject out of any photo and download a clean transparent PNG in seconds. Free, no watermark and no export limit — the AI model runs in your browser.",
  "sign-pdf":
    "Draw, type or upload a signature and place it anywhere on a PDF, then download the signed file. Free with no account, and the PDF never leaves your browser.",
  "protect-pdf":
    "Add a password to a PDF, or remove one you already know, in a couple of clicks. Free with no signup — encryption happens locally so the file is never uploaded.",
  "media-convert":
    "Convert between MP4, WebM, MP3 and WAV right in your browser using WebAssembly. Free with no upload, no queue and no signup, however long the clip is.",
  "watermark-pdf":
    "Stamp a text or image watermark across every page of a PDF, with control over opacity, size and angle. Free, no signup, and processed inside your browser.",
  "barcode-generator":
    "Generate CODE128, EAN-13, UPC and ITF barcodes and download them as PNG or SVG for print. Free with no signup, and every barcode is rendered in your browser.",
};



/** Locale templates used when a slug has no hand-written translation yet. */
const templates: Record<Locale, { title: (n: string) => string; desc: (d: string) => string }> = {
  en: {
    title: (n) => `${n} — Free Online Tool · EasyFileMagic`,
    // Avoid repeating "browser" when the tool's own copy already says it.
    desc: (d) =>
      /browser/i.test(d)
        ? `${d} 100% free with no signup, no watermark and no daily limit.`
        : `${d} 100% free, runs in your browser, no signup.`,

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
        // WebApplication is a subtype of SoftwareApplication; declaring both
        // keeps the generic software rich result while describing it accurately.
        "@type": ["SoftwareApplication", "WebApplication"],
        name: tool.name,
        description,
        inLanguage: LOCALE_META[locale].tag,
        applicationCategory: "UtilitiesApplication",
        applicationSubCategory: tool.category,
        operatingSystem: "Any",
        browserRequirements: "Requires a modern browser with JavaScript enabled",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        // No aggregateRating: we do not collect real review data, and
        // fabricated ratings are a structured-data policy violation.
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
