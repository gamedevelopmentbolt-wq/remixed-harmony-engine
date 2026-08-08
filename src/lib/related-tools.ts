import { tools, type Tool } from "@/lib/tools";

/**
 * Curated cross-links for high-traffic converters. These beat the generic
 * same-category fallback because the natural "next job" after a conversion is
 * usually the reverse conversion or a neighbouring format.
 */
const CURATED: Record<string, string[]> = {
  "pdf-word": ["pdf-word-ocr", "pdf-to-csv", "merge-pdf", "compress-pdf", "pdf-to-text"],
  "pdf-word-ocr": ["pdf-word", "ocr", "pdf-to-text", "compress-pdf"],
  "image-converter": ["bulk-image-compress", "compress-image", "heic-to-jpg", "image-resize", "svg-to-png"],
  "compress-image": ["image-converter", "bulk-image-compress", "image-resize", "file-size-reducer"],
  "bulk-image-compress": ["compress-image", "image-converter", "image-resize", "exif-remover"],
  "heic-to-jpg": ["image-converter", "compress-image", "image-resize", "bulk-image-compress"],
  "merge-pdf": ["split-pdf", "compress-pdf", "pdf-organize", "rotate-pdf", "pdf-word"],
  "split-pdf": ["merge-pdf", "pdf-organize", "pdf-crop", "extract-images-pdf"],
  "compress-pdf": ["merge-pdf", "split-pdf", "pdf-to-jpg", "file-size-reducer"],
  "pdf-to-jpg": ["image-to-pdf", "extract-images-pdf", "pdf-to-text", "compress-image"],
  "image-to-pdf": ["pdf-to-jpg", "merge-pdf", "compress-pdf", "text-to-pdf"],
  "pdf-to-csv": ["pdf-word", "csv-json", "pdf-to-text", "ocr"],
  "pdf-to-pptx": ["pdf-word", "pdf-to-jpg", "pdf-to-text", "merge-pdf"],
  "pdf-to-text": ["pdf-word", "ocr", "pdf-to-csv", "text-to-pdf"],
  "remove-background": ["product-bg-remover", "photo-id-maker", "image-resize", "compress-image"],
  "product-bg-remover": ["remove-background", "image-resize", "watermark-image", "bulk-image-compress"],
  "photo-id-maker": ["remove-background", "image-crop", "image-resize", "compress-image"],
  "timestamp-converter": ["epoch-diff", "cron-parser", "unit-converter", "age-calculator-hijri"],
  "pdf-editor": ["sign-pdf", "watermark-pdf", "page-numbers-pdf", "pdf-organize", "merge-pdf"],
  "sign-pdf": ["pdf-editor", "signature-maker", "protect-pdf", "watermark-pdf"],
  "csv-json": ["json-format", "json-yaml", "json-to-sql", "pdf-to-csv"],
  "ocr": ["pdf-word-ocr", "pdf-to-text", "pdf-word", "image-to-pdf"],
};

const STOP = new Set([
  "the","a","an","and","or","to","for","from","of","in","on","into","with","your",
  "any","it","them","one","free","online","tool","file","files","browser","without",
  "no","you","that","this","every","each","up","out","back","as","by","at","is","are",
]);

/** Lowercase content words from a tool's slug, name and description. */
function tokens(t: Tool): Set<string> {
  return new Set(
    `${t.slug} ${t.name} ${t.description}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

/**
 * Relevance of `candidate` to `self`: shared category plus keyword overlap on
 * slug/name/description. Keeps suggestions topical (PDF editor -> sign/merge/
 * watermark PDF) without hardcoding every pair.
 */
function score(self: Tool, selfTokens: Set<string>, candidate: Tool): number {
  let s = candidate.category === self.category ? 3 : 0;
  const ct = tokens(candidate);
  for (const w of selfTokens) if (ct.has(w)) s += 2;
  return s;
}

/**
 * Related tools for a slug: curated picks first, then the highest-scoring
 * category/keyword matches, then any remaining tool so the strip is never short.
 */
export function getRelatedTools(slug: string, limit = 4): Tool[] {
  const self = tools.find((t) => t.slug === slug);
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const picked: Tool[] = [];
  const seen = new Set<string>([slug]);

  const push = (t: Tool | undefined) => {
    if (!t || seen.has(t.slug) || picked.length >= limit) return;
    seen.add(t.slug);
    picked.push(t);
  };

  for (const s of CURATED[slug] ?? []) push(bySlug.get(s));

  if (self) {
    const selfTokens = tokens(self);
    const ranked = tools
      .filter((t) => !seen.has(t.slug))
      .map((t) => ({ t, s: score(self, selfTokens, t) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.t.n.localeCompare(b.t.n));
    for (const { t } of ranked) push(t);
  }

  for (const t of tools) push(t);

  return picked;
}
