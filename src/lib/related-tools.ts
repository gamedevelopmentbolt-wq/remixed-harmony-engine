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

/**
 * Related tools for a slug: curated picks first, topped up with same-category
 * tools, then any remaining tool so the strip is never short.
 */
export function getRelatedTools(slug: string, limit = 6): Tool[] {
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
  if (self) for (const t of tools) if (t.category === self.category) push(t);
  for (const t of tools) push(t);

  return picked;
}
