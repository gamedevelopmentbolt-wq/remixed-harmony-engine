// Public changelog. Keep entries factual — each bullet should describe an
// end-user-visible change. Order: newest first. Dates are ISO.

export interface ChangelogEntry {
  date: string; // ISO
  title: string;
  items: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-07-26",
    title: "AI Prompts library + honest competitor comparisons",
    items: [
      "New /ai-prompts page with 40+ copy-paste prompts for ChatGPT, Midjourney and DALL·E, one-click copy, category filter and live search.",
      "New /vs comparison pages: EasyFileMagic vs iLovePDF, vs Smallpdf, and vs Adobe Acrobat online tools — honest feature-by-feature tables.",
      "New Changelog page (this one) so returning visitors can see what's actually being shipped.",
      "Blog posts now have social share buttons for X, LinkedIn, Facebook, WhatsApp and Reddit.",
      "404 page now suggests popular tools instead of leaving you at a dead end.",
      "HowTo structured data added on top tools — better chance of winning featured snippets.",
      "Blog RSS feed added at /blog.rss.xml.",
    ],
  },
  {
    date: "2026-07-26",
    title: "10 new tools + faster tool loading",
    items: [
      "New PDF tools: PDF → CSV (table extract), PDF Redact.",
      "New Image tool: Image Upscaler (up to 4×, high-quality multi-pass).",
      "New Convert tool: Audio Trimmer (in-browser, exports WAV).",
      "New Data & Utility tools: JSON → SQL, HTML Minifier, CSS Beautifier, Mock Data Generator, SQL Formatter, YAML Formatter.",
      "Every tool now loads its own JavaScript chunk on demand — most tool pages are noticeably faster to open.",
    ],
  },
  {
    date: "2026-07-18",
    title: "New translated blog posts + Arabic RTL polish",
    items: [
      "Added French, German and Arabic articles for the most-searched topics (compress PDF, PDF → Word).",
      "Arabic articles now render in proper right-to-left with correct hreflang linking.",
    ],
  },
  {
    date: "2026-07-10",
    title: "10 utility tools + more free calculators",
    items: [
      "New Data & Utility tools: PDF → Text, PDF Organize, PDF Crop, PDF Metadata Editor, Image Crop, Image Flip & Rotate, SVG → PNG, Favicon Generator, Epoch Diff, Hash Text.",
      "Added Color Contrast, CSS Gradient, Box Shadow, Cron Parser, Percentage Calculator and Image → ASCII.",
    ],
  },
  {
    date: "2026-06-28",
    title: "New PDF Editor + tools for Pakistan-market users",
    items: [
      "PDF Editor: add text, shapes, highlights, drawings, images and signatures to any PDF — free where iLovePDF and Smallpdf charge.",
      "PKR Salary Slip / Invoice Generator, ATS-friendly Resume Builder, Age Calculator with Hijri date.",
    ],
  },
];