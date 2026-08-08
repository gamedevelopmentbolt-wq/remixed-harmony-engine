export type ToolCategory = "PDF" | "Image" | "Convert" | "Data & Utility" | "AI";

export interface Tool {
  n: string; // "01"
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string; // lucide icon name
  network?: boolean; // needs to download a WASM/model bundle
}

export const tools: Tool[] = [
  { n: "01", slug: "merge-pdf", name: "Merge PDF", category: "PDF", icon: "Files", description: "Combine multiple PDF files into one, in order." },
  { n: "02", slug: "pdf-editor", name: "PDF Editor", category: "PDF", icon: "Pencil", description: "Add text, images, highlights, drawings, shapes and signatures to any PDF — free, unlike iLovePDF & Smallpdf." },
  { n: "03", slug: "split-pdf", name: "Split PDF", category: "PDF", icon: "Scissors", description: "Break a PDF into single-page files, delivered as a ZIP." },
  { n: "04", slug: "compress-pdf", name: "Compress PDF", category: "PDF", icon: "Minimize2", description: "Shrink a PDF's file size for email or upload." },
  { n: "05", slug: "pdf-to-jpg", name: "PDF to JPG", category: "Convert", icon: "FileImage", description: "Turn every page of a PDF into a JPG image." },
  { n: "06", slug: "image-to-pdf", name: "Image to PDF", category: "Convert", icon: "FileType2", description: "Combine JPG or PNG photos into one PDF." },
  { n: "07", slug: "compress-image", name: "Compress Image", category: "Image", icon: "ImageDown", description: "Reduce JPG/PNG size while keeping it sharp." },
  { n: "08", slug: "image-converter", name: "Image Converter", category: "Image", icon: "Repeat", description: "Switch images between JPG, PNG and WEBP." },
  { n: "09", slug: "qr-code-generator", name: "QR Code Generator", category: "Data & Utility", icon: "QrCode", description: "Turn a link or text into a downloadable QR code." },
  { n: "10", slug: "csv-json", name: "CSV ⇄ JSON", category: "Data & Utility", icon: "ArrowLeftRight", description: "Convert CSV to JSON or JSON back to CSV." },
  { n: "11", slug: "zip-files", name: "Zip Files", category: "Data & Utility", icon: "Archive", description: "Bundle multiple files into one .zip archive." },
  { n: "12", slug: "ocr", name: "OCR (Image/PDF → Text)", category: "Convert", icon: "ScanText", description: "Pull real, selectable text out of images and PDF pages.", network: true },
  { n: "13", slug: "pdf-word", name: "PDF ⇄ Word", category: "Convert", icon: "FileText", description: "Convert PDFs to editable Word files and Word docs to PDF." },
  { n: "14", slug: "remove-background", name: "Remove Background", category: "Image", icon: "Eraser", description: "Cut a subject out of a photo — clean transparent PNG.", network: true },
  { n: "15", slug: "sign-pdf", name: "Sign PDF", category: "PDF", icon: "PenLine", description: "Draw or type a signature and place it on any page of a PDF." },
  { n: "16", slug: "protect-pdf", name: "Protect / Unlock PDF", category: "PDF", icon: "Lock", description: "Add a password to a PDF or remove one you already know." },
  { n: "17", slug: "media-convert", name: "Audio / Video Converter", category: "Convert", icon: "FileVideo", description: "Convert MP4, WebM, MP3 and WAV right in your browser.", network: true },
  { n: "18", slug: "rotate-pdf", name: "Rotate & Reorder PDF", category: "PDF", icon: "RotateCw", description: "Rotate pages 90°, reorder them by drag, or delete pages you don't need." },
  { n: "19", slug: "image-resize", name: "Resize & Crop Image", category: "Image", icon: "Crop", description: "Resize to exact pixel dimensions or crop with a visual selection." },
  { n: "20", slug: "heic-to-jpg", name: "HEIC to JPG / PNG", category: "Image", icon: "ImagePlus", description: "Convert Apple HEIC photos to JPG or PNG, straight in your browser." },
  { n: "21", slug: "pdf-to-pptx", name: "PDF to PowerPoint", category: "Convert", icon: "Presentation", description: "Turn each PDF page into a slide in a downloadable .pptx file." },
  { n: "22", slug: "file-hash", name: "File Hash / Checksum", category: "Data & Utility", icon: "Hash", description: "MD5, SHA-1 and SHA-256 checksums for any file — computed locally." },
  { n: "23", slug: "watermark-pdf", name: "Watermark PDF", category: "PDF", icon: "Stamp", description: "Stamp a text or image watermark across every page of a PDF." },
  { n: "24", slug: "page-numbers-pdf", name: "Add Page Numbers", category: "PDF", icon: "ListOrdered", description: "Insert page numbers in any corner, with format and starting-number options." },
  { n: "25", slug: "barcode-generator", name: "Barcode Generator", category: "Data & Utility", icon: "Barcode", description: "Generate CODE128, EAN, UPC and ITF barcodes as PNG or SVG." },
  { n: "26", slug: "color-palette", name: "Image Color Palette", category: "Image", icon: "Palette", description: "Extract the dominant colors from any image as click-to-copy hex codes." },
  { n: "27", slug: "text-to-pdf", name: "Text / Markdown to PDF", category: "Convert", icon: "FileType", description: "Render plain text or Markdown into a clean, downloadable PDF." },
  { n: "28", slug: "extract-images-pdf", name: "Extract Images from PDF", category: "PDF", icon: "ImageDown", description: "Pull every embedded image out of a PDF and download them as a ZIP." },
  { n: "29", slug: "meme-generator", name: "Meme Generator", category: "Image", icon: "Smile", description: "Add classic top / bottom captions to any image and download the meme as a PNG." },
  { n: "30", slug: "json-format", name: "JSON Formatter & Validator", category: "Data & Utility", icon: "Braces", description: "Pretty-print or minify JSON, validate syntax with clear error location, and copy or download." },
  { n: "31", slug: "base64", name: "Base64 Encode / Decode", category: "Data & Utility", icon: "Binary", description: "Encode text or any file to Base64, or decode Base64 back into text or a downloadable file." },
  { n: "32", slug: "video-to-gif", name: "Video to GIF", category: "Convert", icon: "Film", description: "Trim a short video clip and convert it to an optimized GIF right in your browser.", network: true },
  { n: "33", slug: "pdf-translator", name: "PDF Translator", category: "PDF", icon: "Languages", description: "Translate a PDF into 15+ languages and download the result as a PDF or text file.", network: true },
  { n: "34", slug: "photo-id-maker", name: "CNIC / Passport Photo Maker", category: "Image", icon: "IdCard", description: "NADRA CNIC, Pakistani passport, UK & US visa photo sizes — auto crop, optional white background, JPG/PNG.", network: true },
  { n: "35", slug: "bulk-image-compress", name: "Bulk Image Compressor & Converter", category: "Image", icon: "Layers", description: "Batch compress and convert many images to WebP, JPG, PNG or AVIF — download all as one ZIP." },
  { n: "36", slug: "pdf-word-ocr", name: "PDF to Word (Urdu / Arabic OCR)", category: "Convert", icon: "FileSearch", description: "Convert PDFs — including scanned Urdu, Arabic and English pages — into an editable Word .docx file.", network: true },
  { n: "37", slug: "salary-invoice-pk", name: "Salary Slip / Invoice Generator", category: "Data & Utility", icon: "Receipt", description: "PKR salary slips and invoices for Pakistani businesses — logo, line items, tax, deductions, PDF export." },
  { n: "38", slug: "age-calculator-hijri", name: "Age Calculator with Hijri Date", category: "Data & Utility", icon: "Cake", description: "Exact age in years, months and days plus your Hijri (Islamic) birth date and Hijri age." },
  { n: "39", slug: "resume-builder", name: "Resume / CV Builder (ATS)", category: "Data & Utility", icon: "UserRound", description: "Clean, ATS-friendly CV templates for the Pakistan job market — form-based editor, one-click PDF." },
  { n: "40", slug: "file-size-reducer", name: "File Size Reducer (WhatsApp / Gmail)", category: "Data & Utility", icon: "Scale", description: "Shrink images to fit under WhatsApp (16 MB), Gmail (25 MB) or any custom limit you choose." },
  { n: "41", slug: "qr-vcard-wifi", name: "QR Code — vCard / WiFi / Payment", category: "Data & Utility", icon: "Contact", description: "Generate QR codes for contact cards, WiFi networks or payment info with live preview, PNG and SVG download." },
  { n: "42", slug: "currency-converter", name: "Currency Converter", category: "Data & Utility", icon: "Coins", description: "Convert PKR, USD, EUR, AED and GBP with live daily exchange rates — updated automatically, works offline after first load." },
  { n: "43", slug: "product-bg-remover", name: "Product Photo Background Remover", category: "Image", icon: "ImageOff", description: "Remove backgrounds from product photos for Amazon, Shopify, Daraz and eBay — white or transparent, 2000px export, no signup.", network: true },
  { n: "44", slug: "unit-converter", name: "Unit Converter (Metric / Imperial)", category: "Data & Utility", icon: "Ruler", description: "Convert length, weight, temperature, volume, area and speed between metric and imperial units instantly in your browser." },
  { n: "45", slug: "watermark-image", name: "Image Watermark (Add & Remove)", category: "Image", icon: "Droplet", description: "Add a text or logo watermark to one or many images, or remove a simple watermark with a brush-mask fill — batch export as ZIP." },
  { n: "46", slug: "signature-maker", name: "Digital Signature Maker", category: "Data & Utility", icon: "Signature", description: "Draw or type your signature and download a clean transparent PNG or SVG — ready to paste into any PDF, Word or email." },
  { n: "47", slug: "qr-scanner", name: "QR Code Reader", category: "Data & Utility", icon: "ScanLine", description: "Decode any QR code from an image or screenshot — locally in your browser, no upload." },
  { n: "48", slug: "word-counter", name: "Word & Character Counter", category: "Data & Utility", icon: "Type", description: "Live word, character, sentence, paragraph and reading-time counts for any text." },
  { n: "49", slug: "case-converter", name: "Case Converter", category: "Data & Utility", icon: "CaseSensitive", description: "Convert text to UPPER, lower, Title, Sentence, camelCase, snake_case, kebab-case and more." },
  { n: "50", slug: "color-converter", name: "Color Converter (HEX ⇄ RGB ⇄ HSL)", category: "Data & Utility", icon: "Pipette", description: "Pick any color and see it in HEX, RGB and HSL — copy each format with one click." },
  { n: "51", slug: "password-generator", name: "Password Generator", category: "Data & Utility", icon: "KeyRound", description: "Strong, cryptographically-random passwords — pick length, character sets and ambiguous-character exclusion." },
  { n: "52", slug: "url-encode", name: "URL Encoder / Decoder", category: "Data & Utility", icon: "Link2", description: "Percent-encode or decode URL components and full URLs — instantly, offline." },
  { n: "53", slug: "timestamp-converter", name: "Unix Timestamp Converter", category: "Data & Utility", icon: "Clock", description: "Convert Unix timestamps (seconds or ms) to and from ISO 8601 and human-readable dates." },
  { n: "54", slug: "markdown-to-html", name: "Markdown to HTML", category: "Convert", icon: "FileCode2", description: "Turn Markdown into clean HTML with live preview — GitHub-flavored syntax supported." },
  { n: "55", slug: "lorem-ipsum", name: "Lorem Ipsum Generator", category: "Data & Utility", icon: "TextQuote", description: "Generate paragraphs, sentences or words of placeholder text for mockups and design work." },
  { n: "56", slug: "text-diff", name: "Text Diff Checker", category: "Data & Utility", icon: "GitCompare", description: "Compare two blocks of text and see additions, removals and unchanged lines side-by-side." },
  { n: "57", slug: "uuid-generator", name: "UUID Generator", category: "Data & Utility", icon: "Fingerprint", description: "Generate up to 1000 RFC 4122 v4 UUIDs at once — copy, bulk-copy or download as .txt." },
  { n: "58", slug: "regex-tester", name: "Regex Tester", category: "Data & Utility", icon: "Regex", description: "Test JavaScript regular expressions live — highlighted matches, capture groups and replacement preview." },
  { n: "59", slug: "line-tools", name: "Line Sort & Dedupe", category: "Data & Utility", icon: "AlignJustify", description: "Sort, deduplicate, trim and reverse lines of text — clean any list in one paste." },
  { n: "60", slug: "slugify", name: "Slugify (Text to URL Slug)", category: "Data & Utility", icon: "Link", description: "Convert titles or phrases into clean, URL-safe slugs — hyphen, underscore, ASCII options." },
  { n: "61", slug: "jwt-decoder", name: "JWT Decoder", category: "Data & Utility", icon: "ShieldCheck", description: "Decode a JSON Web Token's header and payload in your browser — signatures shown but never sent to a server." },
  { n: "62", slug: "json-yaml", name: "JSON ⇄ YAML Converter", category: "Convert", icon: "FileJson", description: "Convert JSON to YAML or YAML back to JSON — pretty output, in-browser, with error location." },
  { n: "63", slug: "html-to-markdown", name: "HTML to Markdown", category: "Convert", icon: "FileCode", description: "Turn any HTML snippet into clean GitHub-flavored Markdown — live preview, copy or download .md." },
  { n: "64", slug: "exif-remover", name: "Image EXIF / Metadata Remover", category: "Image", icon: "ShieldOff", description: "Strip EXIF, GPS and camera metadata from JPG, PNG or WEBP photos — protect your privacy before sharing." },
  { n: "65", slug: "number-base", name: "Number Base Converter", category: "Data & Utility", icon: "Sigma", description: "Convert numbers between binary, octal, decimal and hex — BigInt-powered, works with huge values." },
  { n: "66", slug: "random-number", name: "Random Number Generator", category: "Data & Utility", icon: "Dices", description: "Generate uniform, unbiased random integers in any range — up to 10,000 at once, unique or with repeats." },
  { n: "67", slug: "bmi-calculator", name: "BMI Calculator", category: "Data & Utility", icon: "HeartPulse", description: "Calculate Body Mass Index in metric or imperial units with the WHO category label." },
  { n: "68", slug: "loan-calculator", name: "Loan / EMI Calculator", category: "Data & Utility", icon: "Landmark", description: "Compute monthly EMI, total interest and a 12-month amortization schedule for any loan." },
  { n: "69", slug: "text-repeat", name: "Text Repeater & Reverser", category: "Data & Utility", icon: "Repeat2", description: "Repeat any text a chosen number of times with a custom separator — optionally reverse each copy." },
  { n: "70", slug: "image-to-base64", name: "Image ⇄ Base64", category: "Image", icon: "Code2", description: "Encode an image to a base64 data URL for CSS/HTML, or decode base64 back into a downloadable image." },
  { n: "71", slug: "pdf-to-text", name: "PDF to Text (.txt)", category: "PDF", icon: "FileText", description: "Extract all selectable text from a PDF and download it as a clean .txt file — everything runs locally." },
  { n: "72", slug: "pdf-organize", name: "Organize PDF Pages", category: "PDF", icon: "LayoutGrid", description: "Reorder, duplicate or delete pages with a visual thumbnail view — save a fresh PDF with your new order." },
  { n: "73", slug: "pdf-crop", name: "Crop PDF Margins", category: "PDF", icon: "Crop", description: "Trim white margins off every page of a PDF for tighter reading on phones and tablets." },
  { n: "74", slug: "pdf-metadata-editor", name: "PDF Metadata Editor", category: "PDF", icon: "Info", description: "Edit title, author, subject, keywords and producer of a PDF file — clean metadata for SEO and archiving." },
  { n: "75", slug: "image-crop", name: "Image Crop (Freeform & Ratios)", category: "Image", icon: "Crop", description: "Crop images with preset ratios (1:1, 4:5, 16:9, story) or freeform — high-quality PNG output." },
  { n: "76", slug: "image-flip-rotate", name: "Flip & Rotate Image", category: "Image", icon: "FlipHorizontal2", description: "Flip horizontally or vertically and rotate by any angle — batch multiple images to one ZIP." },
  { n: "77", slug: "svg-to-png", name: "SVG to PNG Converter", category: "Convert", icon: "FileImage", description: "Rasterize any SVG to a PNG at the exact resolution you choose — transparent or white background." },
  { n: "78", slug: "favicon-generator", name: "Favicon Generator", category: "Image", icon: "AppWindow", description: "Turn one square image into a full favicon pack (16 to 512 px + ICO + manifest) with ready-to-paste HTML." },
  { n: "79", slug: "epoch-diff", name: "Date & Timestamp Diff", category: "Data & Utility", icon: "Timer", description: "Compute the duration between two dates or Unix timestamps in seconds, minutes, hours, days, months and years." },
  { n: "80", slug: "hash-text", name: "Text Hash (MD5, SHA-256)", category: "Data & Utility", icon: "Hash", description: "MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text — computed with the Web Crypto API." },
  { n: "81", slug: "color-contrast", name: "WCAG Color Contrast Checker", category: "Image", icon: "Contrast", description: "Check foreground and background color contrast against WCAG 2.1 AA and AAA — instant pass/fail with a live preview." },
  { n: "82", slug: "css-gradient", name: "CSS Gradient Generator", category: "Data & Utility", icon: "Palette", description: "Design linear or radial CSS gradients visually and copy production-ready CSS in one click." },
  { n: "83", slug: "box-shadow", name: "CSS Box Shadow Generator", category: "Data & Utility", icon: "Square", description: "Craft a CSS box-shadow with offset, blur, spread, color, opacity and inset — copy the exact CSS." },
  { n: "84", slug: "cron-parser", name: "Cron Expression Explainer", category: "Data & Utility", icon: "Clock", description: "Paste any 5-field cron expression and get a plain-English explanation of when it runs, with syntax validation." },
  { n: "85", slug: "percentage-calculator", name: "Percentage Calculator", category: "Data & Utility", icon: "Percent", description: "Four calculators in one: X% of Y, X is what % of Y, percentage change, and tip splitting." },
  { n: "86", slug: "image-to-ascii", name: "Image to ASCII Art", category: "Image", icon: "Type", description: "Turn any photo into ASCII art in your browser — adjustable width, invertible, copy or download as .txt." },
];

// --- 2026-07-26: additional non-duplicate tools ---
tools.push(
  { n: "87", slug: "pdf-to-csv", name: "PDF to CSV (Table Extract)", category: "Convert", icon: "Table", description: "Extract tables from a text-based PDF into a spreadsheet-friendly CSV — rows grouped by position, ready for Excel or Google Sheets." },
  { n: "88", slug: "pdf-redact", name: "PDF Redact (Black-out Text)", category: "PDF", icon: "SquareDashed", description: "Enter words or phrases and the tool draws black rectangles over every match — download a redacted PDF, in-browser." },
  { n: "89", slug: "image-upscaler", name: "Image Upscaler (2× / 3× / 4×)", category: "Image", icon: "ZoomIn", description: "Enlarge photos 2×, 3× or 4× with high-quality multi-pass scaling — cleaner results than a single stretch." },
  { n: "90", slug: "audio-trimmer", name: "Audio Trimmer (MP3 / WAV / M4A)", category: "Convert", icon: "AudioLines", description: "Cut a section out of any audio file with precise start/end sliders — exports a clean WAV, in your browser." },
  { n: "91", slug: "json-to-sql", name: "JSON to SQL", category: "Convert", icon: "Database", description: "Turn a JSON array into CREATE TABLE + INSERT statements — types are auto-inferred per column." },
  { n: "92", slug: "html-minifier", name: "HTML Minifier", category: "Data & Utility", icon: "Minus", description: "Strip comments and whitespace from HTML — see bytes saved live, copy or download the minified output." },
  { n: "93", slug: "css-beautify", name: "CSS Beautifier / Unminifier", category: "Data & Utility", icon: "FileCode", description: "Turn minified or messy CSS into cleanly indented, one-declaration-per-line source." },
  { n: "94", slug: "mock-data", name: "Mock Data Generator", category: "Data & Utility", icon: "Sparkles", description: "Generate up to 10,000 rows of realistic fake data (names, emails, dates, IDs, booleans…) as JSON or CSV." },
  { n: "95", slug: "sql-formatter", name: "SQL Formatter", category: "Data & Utility", icon: "AlignLeft", description: "Format any SQL query with uppercased keywords and one clause per line — SELECT, JOINs, GROUP BY, UNIONs." },
  { n: "96", slug: "yaml-formatter", name: "YAML Formatter & Validator", category: "Data & Utility", icon: "FileCog", description: "Parse, validate and re-dump YAML with clean 2-space indentation — pinpoints syntax errors as you type." },
);

// --- 2026-07-27: genuine open-source AI tools (transformers.js, run in-browser) ---
tools.push(
  { n: "97", slug: "ai-summarizer", name: "AI Text Summarizer", category: "AI", icon: "BookOpenText", description: "Summarize any long text with an open-source DistilBART model that runs entirely in your browser. First run downloads ~150 MB.", network: true },
  { n: "98", slug: "ai-image-caption", name: "AI Image Caption Generator", category: "AI", icon: "ImageDown", description: "Generate an English caption for any photo using an open-source ViT-GPT2 model — 100% in-browser, no signup. First run ~180 MB.", network: true },
  { n: "99", slug: "ai-transcribe", name: "AI Speech-to-Text (Whisper)", category: "AI", icon: "Mic", description: "Transcribe audio in 90+ languages with OpenAI's open-source Whisper model running locally in your browser. First run ~80 MB.", network: true },
  { n: "100", slug: "ai-upscale", name: "AI Image Upscaler (2×)", category: "AI", icon: "ZoomIn", description: "Enlarge photos 2× with a real Swin2SR super-resolution neural network — sharper than plain resize. In-browser, no signup. First run ~50 MB.", network: true },
);

// --- 2026-07-29: new high-demand client-side tools ---
tools.push(
  { n: "101", slug: "invoice-generator", name: "Invoice Generator", category: "PDF", icon: "ReceiptText", description: "Create a professional PDF invoice — line items, tax, totals and payment notes — generated in your browser, no signup." },
  { n: "102", slug: "pdf-nup", name: "Multiple Pages Per Sheet (N-up)", category: "PDF", icon: "LayoutGrid", description: "Print 2, 4, 6 or 9 PDF pages on a single sheet — save paper on handouts, scripts and slide decks." },
  { n: "103", slug: "photo-collage", name: "Photo Collage Maker", category: "Image", icon: "Grid2x2", description: "Combine photos into one grid collage sized for Instagram, Stories or wide banners — spacing, rounding and background colour included." },
  { n: "104", slug: "csv-to-pdf", name: "CSV to PDF Table", category: "Convert", icon: "Table2", description: "Turn a CSV or spreadsheet export into a clean, paginated PDF table with headers and striped rows." },
);

export const categories: { key: ToolCategory | "All"; label: string }[] = [
  { key: "All", label: "All" },
  { key: "AI", label: "AI" },
  { key: "PDF", label: "PDF" },
  { key: "Image", label: "Image" },
  { key: "Convert", label: "Convert" },
  { key: "Data & Utility", label: "Data & Utility" },
];
