// Honest, tool-by-tool comparison data for competitor-brand SEO pages.
// Every claim below is either about EasyFileMagic (verifiable on this site)
// or a factual, publicly-known limitation of the competitor's free tier at
// the time of writing. If any competitor changes its free tier, update the
// "notes" so this stays accurate.

export interface ComparisonRow {
  feature: string;
  efm: string;
  competitor: string;
  advantage: "efm" | "competitor" | "tie";
}

export interface ComparisonTarget {
  /** URL slug: /vs/{slug} */
  slug: string;
  /** Competitor display name */
  competitorName: string;
  /** SEO title for the page */
  metaTitle: string;
  /** SEO description */
  metaDescription: string;
  /** Search terms this page targets (for internal reference / copy) */
  targetKeywords: string[];
  /** One-line honest summary shown at the top */
  tldr: string;
  /** Direct-answer paragraph (feeds AI answer engines) */
  quickAnswer: string;
  /** Feature-by-feature comparison table */
  rows: ComparisonRow[];
  /** Honest "when the competitor is the better pick" */
  whenTheyWin: string[];
  /** Honest "when EasyFileMagic is the better pick" */
  whenWeWin: string[];
  /** Suggested EasyFileMagic tool slugs to CTA to */
  ctaToolSlugs: string[];
  /**
   * Optional side-by-side tool coverage for one category. Our side is derived
   * from the real tool registry at render time; the competitor side lists the
   * tool names they publicly advertise (names only — no invented numbers).
   */
  toolCoverage?: {
    /** Heading label, e.g. "PDF tools" */
    label: string;
    /** Predicate key used to select our tools from the registry */
    ourFilter: "pdf";
    /** Competitor's publicly listed tool names in this category */
    competitorTools: string[];
    /** Honest note about the gaps in either direction */
    note?: string;
  };
  /** Optional last-updated ISO date (page shows month/year) */
  updated?: string;
}

export const comparisonTargets: ComparisonTarget[] = [
  {
    slug: "ilovepdf",
    competitorName: "iLovePDF",
    metaTitle: "iLovePDF Alternative — EasyFileMagic (Free, No Signup, No Upload)",
    metaDescription:
      "Looking for a free iLovePDF alternative? EasyFileMagic runs entirely in your browser — merge, split and compress PDFs with no signup, no watermark and no daily limit.",
    targetKeywords: ["ilovepdf alternative", "free ilovepdf", "ilovepdf no signup"],
    tldr:
      "EasyFileMagic is a free, browser-only alternative to iLovePDF. Same core PDF tools, but files never leave your device — no upload, no account, no daily task cap.",
    quickAnswer:
      "iLovePDF is a solid, well-known PDF suite, but its free tier caps tasks per day, requires an account for many tools, and uploads every file to its servers for processing. EasyFileMagic runs the same core operations (merge, split, compress, convert, sign, protect) locally in your browser using JavaScript and WebAssembly — no upload, no account, no watermark, no daily limit.",
    rows: [
      { feature: "Sign-up required", efm: "Never", competitor: "Free tier limited without account", advantage: "efm" },
      { feature: "Files uploaded to a server", efm: "No — processed in your browser", competitor: "Yes — uploaded, processed, then deleted", advantage: "efm" },
      { feature: "Watermarks on output", efm: "None, ever", competitor: "None on core tools", advantage: "tie" },
      { feature: "Daily task limit", efm: "None", competitor: "Free tier limited per hour/day", advantage: "efm" },
      { feature: "File size limit", efm: "Limited by your device RAM", competitor: "Free tier caps around 100 MB", advantage: "efm" },
      { feature: "Number of core PDF tools", efm: "20+ PDF tools + 70 more (image, convert, data)", competitor: "~25 PDF tools", advantage: "tie" },
      { feature: "Desktop / mobile apps", efm: "Web-only (works on any browser)", competitor: "Yes, iOS / Android / Desktop apps", advantage: "competitor" },
      { feature: "OCR", efm: "Yes, in-browser (Tesseract)", competitor: "Yes, on server", advantage: "tie" },
      { feature: "Batch processing", efm: "Yes, unlimited files", competitor: "Free tier limited", advantage: "efm" },
      { feature: "Team / API access", efm: "Not offered", competitor: "Paid business plans available", advantage: "competitor" },
      { feature: "Price", efm: "$0 — always", competitor: "Free tier + paid plans from ~$4/mo", advantage: "efm" },
    ],
    whenTheyWin: [
      "You need a native mobile or desktop app rather than a browser tab.",
      "You need a business/API plan for team-wide document processing.",
      "You need to process a very large PDF (multi-GB) that your device can't hold in memory.",
    ],
    whenWeWin: [
      "You care about privacy — you don't want your document leaving your computer.",
      "You just need to do one job, right now, without creating another account.",
      "You hit iLovePDF's daily task or file-size cap and don't want to pay for occasional use.",
      "You want more than PDFs — image, convert, OCR, media and data tools in one place.",
    ],
    ctaToolSlugs: ["merge-pdf", "split-pdf", "compress-pdf", "pdf-word", "sign-pdf", "protect-pdf"],
    toolCoverage: {
      label: "PDF tools",
      ourFilter: "pdf",
      // Tool names iLovePDF publicly lists on its own tools page. Names only —
      // no invented limits, prices or performance numbers.
      competitorTools: [
        "Merge PDF",
        "Split PDF",
        "Compress PDF",
        "PDF to Word",
        "PDF to PowerPoint",
        "PDF to Excel",
        "Word to PDF",
        "PowerPoint to PDF",
        "Excel to PDF",
        "Edit PDF",
        "PDF to JPG",
        "JPG to PDF",
        "Sign PDF",
        "Watermark PDF",
        "Rotate PDF",
        "HTML to PDF",
        "Unlock PDF",
        "Protect PDF",
        "Organize PDF",
        "PDF to PDF/A",
        "Repair PDF",
        "Page numbers",
        "Scan to PDF",
        "OCR PDF",
        "Compare PDF",
        "Redact PDF",
      ],
      note:
        "iLovePDF covers Office-format conversions (Excel, PowerPoint) and PDF/A archival that we don't. We cover jobs they don't list — PDF translation, metadata editing, margin cropping, N-up printing, invoice generation and text extraction — and every one of ours runs locally in your browser.",
    },
    updated: "2026-08-08",
  },
  {
    slug: "smallpdf",
    competitorName: "Smallpdf",
    metaTitle: "Smallpdf Alternative — EasyFileMagic (Free, No Signup, No Watermark)",
    metaDescription:
      "Looking for a free Smallpdf alternative without the 2-task-per-day free-trial wall? EasyFileMagic runs in your browser — unlimited use, no signup, no watermark, no upload.",
    targetKeywords: ["smallpdf alternative", "smallpdf free", "smallpdf without signup"],
    tldr:
      "EasyFileMagic is a free Smallpdf alternative with no 2-task-per-day free-tier limit and no account wall. Files are processed in your browser, not uploaded.",
    quickAnswer:
      "Smallpdf is polished and easy to use, but its free tier is deliberately restrictive: a small number of tasks per day and a signup prompt for most tools. EasyFileMagic has no daily task cap, no signup, no watermark, and processes files entirely in your browser rather than on a server — a genuine privacy difference for sensitive documents.",
    rows: [
      { feature: "Free daily task limit", efm: "Unlimited", competitor: "Free tier limited to ~2 tasks / day / device", advantage: "efm" },
      { feature: "Sign-up required", efm: "Never", competitor: "Required for most tools after free tier", advantage: "efm" },
      { feature: "Files uploaded to a server", efm: "No — local, in-browser", competitor: "Yes — uploaded, processed, deleted", advantage: "efm" },
      { feature: "Watermarks", efm: "None", competitor: "None on outputs", advantage: "tie" },
      { feature: "File size limit (free)", efm: "Bounded only by your device RAM", competitor: "Free tier limited (~15 MB / file)", advantage: "efm" },
      { feature: "Number of tools", efm: "90+ browser tools across PDF, image, convert, data", competitor: "~30 PDF-focused tools", advantage: "efm" },
      { feature: "eSign & request-signature", efm: "In-browser signature only", competitor: "Full eSign workflow (paid)", advantage: "competitor" },
      { feature: "Google Workspace / Dropbox integrations", efm: "Not offered", competitor: "Yes", advantage: "competitor" },
      { feature: "OCR", efm: "Yes, in-browser", competitor: "Yes, on server (Pro)", advantage: "tie" },
      { feature: "Price", efm: "$0 forever", competitor: "Free tier + Pro from ~$9/mo", advantage: "efm" },
    ],
    whenTheyWin: [
      "You need a full eSign / request-signature workflow with legal audit trail.",
      "You want native cloud-storage integrations (Dropbox, Google Drive, OneDrive).",
      "You need mobile apps with offline sync.",
    ],
    whenWeWin: [
      "You hit Smallpdf's 2-task-per-day wall and don't want to pay $9/mo for occasional use.",
      "You don't want to hand your file to a server just to shrink it.",
      "You need image, media, OCR and data tools in the same tab as PDF tools.",
      "You want to use it on a shared or work computer without leaving an account behind.",
    ],
    ctaToolSlugs: ["compress-pdf", "merge-pdf", "pdf-word", "pdf-editor", "sign-pdf", "ocr"],
    updated: "2026-07-26",
  },
  {
    slug: "adobe-acrobat-online",
    competitorName: "Adobe Acrobat online tools",
    metaTitle: "Adobe Acrobat Online Alternative — EasyFileMagic (Free, No Signup)",
    metaDescription:
      "Adobe Acrobat online tools are free but require an Adobe account and upload every file. EasyFileMagic gives you the same core tools with no signup and no upload.",
    targetKeywords: [
      "adobe acrobat online free",
      "adobe acrobat alternative",
      "free alternative to adobe acrobat",
    ],
    tldr:
      "Adobe's free online tools are good, but they require an Adobe ID and upload every file. EasyFileMagic runs in your browser — no Adobe account, no upload, no per-day cap.",
    quickAnswer:
      "Adobe Acrobat's free online tools are trustworthy for one-off jobs but push you to sign in with an Adobe ID after a couple of uses and process every file on Adobe's cloud. EasyFileMagic runs the same core tools — merge, split, compress, convert, OCR, sign — entirely in your browser, with no Adobe account, no upload, and no daily cap.",
    rows: [
      { feature: "Adobe account required", efm: "No", competitor: "Required after first free use in most cases", advantage: "efm" },
      { feature: "Files uploaded to Adobe cloud", efm: "No", competitor: "Yes", advantage: "efm" },
      { feature: "Free daily task limit", efm: "Unlimited", competitor: "Free use limited per tool", advantage: "efm" },
      { feature: "Full Acrobat desktop editor", efm: "Not offered", competitor: "Yes — industry-standard Acrobat Pro", advantage: "competitor" },
      { feature: "Advanced PDF forms (AcroForm/XFA)", efm: "Basic form fields only", competitor: "Full authoring & scripting", advantage: "competitor" },
      { feature: "PDF/A archival & preflight", efm: "Not offered", competitor: "Yes", advantage: "competitor" },
      { feature: "Everyday jobs (merge, split, compress, convert)", efm: "Yes — 90+ browser tools", competitor: "Yes — a curated set", advantage: "tie" },
      { feature: "Legal eSign workflow", efm: "In-browser signature only", competitor: "Adobe Sign (paid) is enterprise-grade", advantage: "competitor" },
      { feature: "OCR quality", efm: "Tesseract (in-browser)", competitor: "Adobe's OCR (server, generally more accurate on hard scans)", advantage: "competitor" },
      { feature: "Price for everyday use", efm: "$0", competitor: "Free tier + Acrobat Pro from ~$15/mo", advantage: "efm" },
    ],
    whenTheyWin: [
      "You need Acrobat Pro-level PDF authoring: complex forms, PDF/A, preflight, redaction with audit trail.",
      "You need Adobe Sign for legally-binding, enterprise-grade signatures.",
      "You have very hard scans where Adobe's server-side OCR is worth the upload.",
    ],
    whenWeWin: [
      "You just need to merge, split, compress or convert a PDF once and don't want to sign into anything.",
      "You don't want the file leaving your device (privacy, NDA, legal, medical work).",
      "You want image, media, and data tools alongside your PDF tools.",
      "You use a device that isn't licensed for Adobe products.",
    ],
    ctaToolSlugs: [
      "merge-pdf",
      "split-pdf",
      "compress-pdf",
      "pdf-word",
      "pdf-editor",
      "ocr",
      "pdf-redact",
    ],
    updated: "2026-07-26",
  },
];

export const findComparison = (slug: string) =>
  comparisonTargets.find((c) => c.slug === slug);