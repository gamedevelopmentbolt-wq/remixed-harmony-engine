# Plan: More Tools + Speed + FR/DE/AR SEO

This is a large scope. I want your OK on the key trade-offs before I write ~30 files.

## Part 1 — New tools (10)

Client-side, no signup, matching `ToolShell` pattern. Each gets: component, entry in `tools.ts`, route registration, `tool-content.ts` summary + 4 FAQs, sitemap + `llms.txt` update.

| Slug | Category | What it does |
|---|---|---|
| `pdf-to-text` | PDF | Extract plain text from a PDF (pdf.js) |
| `pdf-organize` | PDF | Reorder / delete / duplicate pages, drag & drop |
| `pdf-crop` | PDF | Crop margins from PDF pages |
| `pdf-metadata-editor` | PDF | Edit title/author/subject/keywords in PDF metadata |
| `image-crop` | Image | Freeform + preset ratio crop (1:1, 4:5, 16:9, story) |
| `image-flip-rotate` | Image | Flip H/V, rotate arbitrary degrees, batch |
| `svg-to-png` | Image | Rasterize SVG at chosen resolution |
| `favicon-generator` | Image | One image → full favicon pack (16/32/180/192/512 + ICO + manifest) |
| `epoch-diff` | Utility | Duration between two timestamps/dates, humanised |
| `hash-text` | Utility | MD5/SHA-1/SHA-256/SHA-512 for text (Web Crypto) |

If you want a different count or different tools, tell me now.

## Part 2 — Speed audit

Concrete, targeted work — not a blanket rewrite.

- **Move CPU-heavy work into Web Workers** (UI stops freezing):
  - OCR (`OcrTool`, `PdfWordOcrTool`) — tesseract.js already supports workers; wire it up with progress reporting.
  - PDF compress (`CompressPdfTool`) — page rasterisation loop.
  - Bulk image compress (`BulkImageCompressTool`) — parallel workers, one per core.
  - Background removal (`RemoveBackgroundTool`, `ProductBgRemoverTool`) — already worker-based in `@imgly/background-removal`; verify + surface progress.
- **Lazy-load heavy libs** via dynamic `import()` inside handlers, not at module top:
  - `pdf-lib`, `pdfjs-dist`, `jspdf`, `tesseract.js`, `@imgly/background-removal`, `jszip`, `html2canvas`.
  - Route-level: split each tool component (already automatic via TanStack, but verify no accidental top-level heavy imports in `tools.$slug.tsx` registry — currently all 70 are eagerly imported; **fix that with `React.lazy` per slug** — this alone should cut first-tool TTFI a lot).
- **Progress indicators**: add a shared `<ProgressBar current total label />` and wire it into the 5 tools above.
- **Reduce re-renders**: memoize file lists, use `useCallback` on drop handlers, avoid `URL.createObjectURL` in render.

If you'd rather I skip the eager-import fix (it touches `tools.$slug.tsx` for every slug), say so.

## Part 3 — FR / DE / AR SEO

The earlier plan proposed **full localized routes** (`/de/tools/merge-pdf`). That's the SEO-correct way but is a big lift: ~40 new route files + hreflang cluster + language switcher + RTL + sitemap doubling. You never confirmed it.

I'll implement the **lighter, still-Google-valid** approach unless you say "do the full route split":

- **Per-tool multilingual meta**: add `titleFr/De/Ar` and `descriptionFr/De/Ar` to `tool-content.ts` for the top ~20 tools (compress-pdf, merge-pdf, pdf-to-word, image-compress, remove-bg, qr-generator, etc.). The route's `head()` picks the language variant based on the `?lang=fr|de|ar` search param when present; canonical stays on the English URL.
- **hreflang cluster on every tool page**:
  ```
  <link rel="alternate" hreflang="en" href="/tools/<slug>" />
  <link rel="alternate" hreflang="fr" href="/tools/<slug>?lang=fr" />
  <link rel="alternate" hreflang="de" href="/tools/<slug>?lang=de" />
  <link rel="alternate" hreflang="ar" href="/tools/<slug>?lang=ar" />
  <link rel="alternate" hreflang="x-default" href="/tools/<slug>" />
  ```
- **On-page keyword blocks**: a collapsed "Also available in / Aussi disponible en / Auch verfügbar auf / متوفر أيضًا بـ" section on each tool page with 2-3 natural-language sentences per language (FR/DE/AR) using the target keyword. Real content, not keyword stuffing.
- **RTL when `?lang=ar`**: set `<html dir="rtl" lang="ar">` from `__root.tsx` based on the current search param; a targeted CSS pass (`.rtl-flip` utility) for the header/hero — most of the site is flex-based and already tolerates RTL.
- **Homepage**: hero H1 stays English; add a small trilingual keyword ribbon below the fold with anchor links into the top 10 tools tagged with `?lang=fr/de/ar`.
- **Sitemap**: add hreflang alternates via `<xhtml:link>` per URL.

Trade-off vs full route split:
- ✅ Real hreflang cluster, real translated titles/descriptions, real on-page keyword content — Google will rank these.
- ✅ Zero routing changes, no risk to existing SEO on English URLs.
- ❌ URLs have `?lang=fr` instead of `/fr/…`. Slightly weaker signal than a prefixed path.

## What to confirm

1. **10 tools list above — OK as-is, or swap any?**
2. **Speed work: OK to convert the eager tool registry in `tools.$slug.tsx` to `React.lazy` per slug?** (biggest win, low risk)
3. **SEO approach: `?lang=` variant (this plan) or full `/fr/…` route split (much bigger)?**
4. **How many tools get translated meta?** Top 20 (this plan) / all 70 / a specific list?

Reply "go" (using defaults above) or with edits.
