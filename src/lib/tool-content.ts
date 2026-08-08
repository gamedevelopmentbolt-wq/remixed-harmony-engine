// Per-tool GEO content: an extractable one-line answer and FAQs (rendered on
// the page and emitted as FAQPage JSON-LD) so answer engines like ChatGPT,
// Perplexity, Google AI Overviews and Copilot can quote the tool directly.

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolContent {
  summary: string; // 1-2 sentences, plain language, extractable answer
  faqs?: ToolFaq[]; // shown on page + emitted as FAQPage JSON-LD
}

const genericFaqs: ToolFaq[] = [
  {
    q: "Is this tool really free?",
    a: "Yes. Every tool on EasyFileMagic is 100% free with no signup, no watermarks, no page limits, and no software to install.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: "No. Files are processed directly in your browser using JavaScript and WebAssembly. Nothing is uploaded to our servers, so your documents never leave your device.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The tools run in any modern browser on desktop, tablet, or mobile (Chrome, Edge, Safari, Firefox). Very large files may be slower on low-end phones.",
  },
];

export const toolContent: Record<string, ToolContent> = {
  "compress-pdf": {
    summary:
      "Compress PDF shrinks the file size of a PDF entirely in your browser by re-encoding each page as a JPEG at a quality level you choose. Nothing is uploaded.",
    faqs: [
      {
        q: "How much smaller will my PDF get?",
        a: "It depends on the source. Scanned or image-heavy PDFs typically shrink by 50–90%. PDFs that are already highly optimized may not shrink much — try the High compression preset for the smallest result.",
      },
      {
        q: "Will text stay selectable after compression?",
        a: "No. Real compression rasterizes each page into an image, so text in the output is part of the picture and cannot be selected or searched. Use OCR afterwards if you need selectable text back.",
      },
      {
        q: "Is there a file size limit?",
        a: "There is no hard limit set by the site. Because compression runs in your browser, practical limits depend on your device's RAM — most desktops handle 200 MB+ PDFs comfortably.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "merge-pdf": {
    summary:
      "Merge PDF combines two or more PDF files into a single PDF in the order you choose. The whole merge happens locally in your browser; your files are never uploaded.",
    faqs: [
      {
        q: "How many PDFs can I merge at once?",
        a: "There is no fixed cap. Merging is handled by your browser, so the practical limit is your device's memory — hundreds of typical PDFs are fine on a normal laptop.",
      },
      {
        q: "Can I reorder the files before merging?",
        a: "Yes. Drag any file in the list up or down to change its position before you click Merge.",
      },
      {
        q: "Do you keep hyperlinks and bookmarks?",
        a: "Internal page content, links and form fields are preserved. Bookmarks (the PDF outline) from each source file are not carried into the merged output.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "pdf-word": {
    summary:
      "PDF ⇄ Word converts PDFs into editable .docx Word files and Word documents back into PDF, right in your browser. No account, no upload, no email required.",
    faqs: [
      {
        q: "Will the Word file look exactly like the PDF?",
        a: "Text content is preserved and grouped by page, and simple layouts convert cleanly. Very complex layouts (multi-column magazines, forms with overlapping fields) may need light manual cleanup in Word.",
      },
      {
        q: "Does it work on scanned PDFs?",
        a: "Scanned PDFs contain images, not text. Run them through the OCR tool first to recover selectable text, then convert that to Word.",
      },
      {
        q: "Which Word versions can open the result?",
        a: "The tool outputs standard .docx, which opens in Microsoft Word 2007 and newer, Word for Mac, Word Online, Google Docs, LibreOffice and Pages.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "ocr": {
    summary:
      "OCR extracts real, selectable text from images and PDF pages using Tesseract running in your browser. Works on scanned documents, screenshots and photos of text.",
    faqs: [
      {
        q: "Which languages are supported?",
        a: "English by default. The underlying Tesseract engine supports 100+ languages; the tool downloads the English language model on first use.",
      },
      {
        q: "How accurate is the recognition?",
        a: "Accuracy is best on clean, high-contrast scans and typed text (often 95%+). Handwriting, low resolution or heavy skew reduce accuracy — retake or straighten the image if possible.",
      },
      {
        q: "Does the language model get uploaded from my files?",
        a: "No. The tool downloads a small OCR model from a public CDN once, then all recognition happens locally on your text and images.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "remove-background": {
    summary:
      "Remove Background cuts the subject out of a photo and returns a clean transparent PNG. The AI model runs in your browser using WebAssembly, so your image never leaves your device.",
    faqs: [
      {
        q: "How well does it handle hair and fine detail?",
        a: "The bundled model is tuned for people, products and pets and generally handles hair, fur and edges well. Very busy backgrounds or low-resolution photos can produce softer edges.",
      },
      {
        q: "What image formats can I upload?",
        a: "JPG, PNG and WebP. The result is always a PNG with a real transparent background so you can drop it onto any color or scene.",
      },
      {
        q: "Does the model download every time?",
        a: "No. The model (~40 MB) is cached by your browser after the first use, so later cutouts start almost instantly.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "extract-images-pdf": {
    summary:
      "Extract Images from PDF pulls every embedded photo, scan or logo out of a PDF and returns them as PNG files in a single ZIP — at their original resolution, all in your browser.",
    faqs: [
      {
        q: "Does this render pages, or extract the real images?",
        a: "It extracts the actual embedded images at their original pixel dimensions, not screenshots of the page. If a PDF has no raster images (pure text or vector), the tool will tell you so.",
      },
      {
        q: "What format are the extracted images in?",
        a: "Every image is written out as a PNG so it opens anywhere. Duplicate images (the same picture reused across pages) are deduplicated.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "meme-generator": {
    summary:
      "Meme Generator adds classic top and bottom captions to any image — Impact font, white text with a black outline — and downloads the result as a PNG. Runs entirely in your browser.",
    faqs: [
      {
        q: "Can I change the font size?",
        a: "Yes. Use the slider to scale the caption between 4% and 18% of the image height. Long captions automatically wrap onto multiple lines.",
      },
      {
        q: "Does it add a watermark?",
        a: "No. The PNG you download is exactly what you see in the preview — no logo, no signup, no watermark.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "json-format": {
    summary:
      "JSON Formatter & Validator pretty-prints or minifies any JSON snippet, points to the exact line and column of syntax errors, and lets you copy or download the result. Runs entirely in your browser.",
    faqs: [
      {
        q: "What does the error message tell me?",
        a: "If your JSON is invalid, the tool reports the line and column of the first parse error along with the underlying reason (missing comma, unexpected token, unterminated string, etc.).",
      },
      {
        q: "How large a JSON file can I paste?",
        a: "There is no hard cap — parsing runs locally in your browser. Files in the tens of megabytes work on a normal laptop; extremely large payloads may slow the textarea.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "base64": {
    summary:
      "Base64 Encode / Decode converts text or any file to Base64 and back — encode a file into a Base64 string, or decode a Base64 string back into a downloadable file. Everything runs in your browser.",
    faqs: [
      {
        q: "Which mode should I use?",
        a: "Use Text ↔ Base64 for strings, tokens or small snippets. Use File → Base64 to inline a file (image, PDF, binary) into a data string, or Base64 → File to reconstruct the original file from a Base64 payload.",
      },
      {
        q: "Is there a file size limit?",
        a: "Base64 is ~33% larger than the original. Files up to ~50 MB encode comfortably in the browser; huge files can be slow because the whole result has to fit in memory as a single string.",
      },
      ...genericFaqs.slice(1),
    ],
  },
  "video-to-gif": {
    summary:
      "Video to GIF trims a short clip out of a video and renders it as an optimized animated GIF using ffmpeg.wasm — with configurable start, duration, frame rate and width, all in your browser.",
    faqs: [
      {
        q: "Why is the first conversion slow?",
        a: "The tool downloads ffmpeg.wasm (~30 MB) on first use. Later conversions in the same browser start immediately from cache.",
      },
      {
        q: "How long can the source video be?",
        a: "You can drop long videos, but only the trimmed segment (start + duration) is converted. Keep GIFs under about 10 seconds at 12–15 fps for reasonable file size.",
      },
      {
        q: "Why is my GIF so large?",
        a: "GIF is an old, inefficient format. Lower the width, drop the frame rate to 10–12 fps, and shorten the duration. The tool already uses a two-pass palette to keep quality high at smaller sizes.",
      },
      ...genericFaqs.slice(1),
    ],
  },
};

toolContent["pdf-translator"] = {
  summary:
    "PDF Translator extracts the text from your PDF in your browser and translates it into 15+ languages (English, Spanish, French, German, Portuguese, Arabic, Hindi, Urdu, Chinese and more) via the free MyMemory translation API, then rebuilds a same-page-count PDF or a plain-text file.",
  faqs: [
    {
      q: "How accurate is the translation?",
      a: "It's a solid first-pass, machine-quality translation powered by the free MyMemory API — great for understanding what a document says, but you'll want a human review for legal, medical or publish-ready copy. Accuracy is best for common European language pairs and drops a bit for less-resourced pairs.",
    },
    {
      q: "Which languages are supported?",
      a: "The picker includes English, Spanish, French, German, Portuguese, Italian, Dutch, Russian, Arabic, Hindi, Urdu, Chinese (Simplified), Japanese, Korean and Turkish — in both directions.",
    },
    {
      q: "Is my PDF uploaded anywhere?",
      a: "The PDF itself never leaves your browser — text extraction and PDF rebuilding happen locally. Only the extracted text is sent to the MyMemory translation service so it can be translated. Avoid using confidential documents for that reason.",
    },
  ],
};

toolContent["currency-converter"] = {
    summary:
      "Currency Converter converts between PKR, USD, EUR, AED and GBP using live daily exchange rates from open.er-api.com, cached in your browser so it keeps working offline.",
    faqs: [
      { q: "Where do the rates come from?", a: "Rates are fetched from the free open.er-api.com feed, which updates daily. They are indicative — banks and money changers apply their own spread." },
      { q: "Does it work offline?", a: "Yes. After the first successful load, the latest rates are cached in your browser, so conversions still work if you go offline." },
      { q: "Can I use it for accounting?", a: "For quick estimates, yes. For invoices, tax filings or bank transfers, always confirm the exact rate with your bank on the day of the transaction." },
      ...genericFaqs.slice(1),
    ],
};

toolContent["product-bg-remover"] = {
    summary:
      "Product Photo Background Remover cuts your product out of any photo and drops it on a clean white or transparent background, sized for Amazon, Shopify, Daraz and eBay — all in your browser.",
    faqs: [
      { q: "Which marketplaces are supported?", a: "Presets are included for Amazon (2000×2000, pure white), Shopify (2048×2048, white or transparent), Daraz and eBay. You can also export at a custom size." },
      { q: "Is the background removal accurate?", a: "It uses an on-device AI model (@imgly/background-removal) that runs in your browser. Results are excellent for clean product shots with a distinct subject; hair, glass and fine mesh can need touch-ups." },
      { q: "Are my product photos uploaded?", a: "No. The AI model downloads once and then everything — including background removal — runs locally in your browser." },
      ...genericFaqs.slice(2),
    ],
};

toolContent["unit-converter"] = {
    summary:
      "Unit Converter switches values between metric and imperial units for length, weight, temperature, volume, area (including local units like marla and kanal) and speed — instantly, in your browser.",
    faqs: [
      { q: "Which unit categories are supported?", a: "Length, weight, temperature (°C, °F, K), volume, area (with Pakistani marla and kanal), and speed. More categories can be added on request." },
      { q: "How precise are the conversions?", a: "Conversions use standard SI factors and are accurate to at least 6 significant figures — enough for engineering, cooking, freight and everyday use." },
      ...genericFaqs,
    ],
};

toolContent["watermark-image"] = {
    summary:
      "Image Watermark lets you stamp a text watermark on one or many images (batch export as a ZIP) or brush over a simple watermark to blur-fill it — all locally, no upload.",
    faqs: [
      { q: "Can I watermark a whole folder at once?", a: "Yes. Drop as many images as you want; the same text, size, opacity, color and position are applied to every image and delivered as a single ZIP." },
      { q: "How good is the watermark remover?", a: "It uses a brush-mask fill that averages the pixels around your brush and paints over the watermark. That works well on plain or lightly textured backgrounds — busy photos with hard, high-contrast watermarks will only be approximate." },
      { q: "Do you support image or logo watermarks?", a: "The current version focuses on text watermarks. Logo-image watermarks are on the roadmap — for now you can pre-render a logo into transparent PNG using the Signature Maker or Meme Generator and composite manually." },
      ...genericFaqs.slice(1),
    ],
};

toolContent["signature-maker"] = {
    summary:
      "Digital Signature Maker lets you draw a signature with your mouse or finger, or type one in a handwriting font, and export a crisp transparent PNG or SVG ready to paste into any PDF, Word doc or email.",
    faqs: [
      { q: "Is the PNG background really transparent?", a: "Yes. The signature is exported on a fully transparent canvas, so it will sit cleanly over any document color or background." },
      { q: "Can I use it on a phone or tablet?", a: "Yes. Drawing works with touch and Apple Pencil / stylus input, so you can sign as naturally as on paper." },
      { q: "Is my signature stored anywhere?", a: "No. Everything happens in your browser. The signature is not saved to any server, and closing the tab discards it unless you download the file." },
      ...genericFaqs.slice(1),
    ],
};

toolContent["qr-scanner"] = {
  summary: "QR Code Reader decodes any QR from a photo or screenshot in your browser using the jsQR library — no upload, no camera permission needed.",
  faqs: [
    { q: "Can it read a QR from a screenshot?", a: "Yes. Any image with a reasonably clear QR — screenshot, phone photo, scanned page — will decode." },
    { q: "What if it says no QR was detected?", a: "The QR may be too small, blurry, cropped or rotated too far. Try a larger, sharper image with the whole QR square visible." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["word-counter"] = {
  summary: "Word & Character Counter shows live word, character, sentence, paragraph, line and reading-time totals for any pasted text — 100% offline.",
  faqs: [
    { q: "How is reading time calculated?", a: "Reading time uses 200 words per minute, speaking time uses 130 wpm — both are standard averages for adult readers." },
    { q: "Does it work with non-English text?", a: "Yes. Words are split on whitespace, so it works with any Latin-script language and gives sensible counts for Urdu, Arabic and CJK text too." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["case-converter"] = {
  summary: "Case Converter transforms text into UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE or iNVERTED case — instantly, in your browser.",
  faqs: [
    { q: "Does it handle acronyms in Title Case?", a: "Title Case capitalises the first letter of each word. Manually preserve acronyms after conversion if needed." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["color-converter"] = {
  summary: "Color Converter turns any HEX color into RGB and HSL (and back) — pick with a native color picker or type any value and watch every notation update together.",
  faqs: [
    { q: "Which formats are supported?", a: "Standard 3- and 6-digit HEX, rgb(r, g, b) with 0–255 channels and hsl(h, s%, l%) with 0–360° hue." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["password-generator"] = {
  summary: "Password Generator creates strong, cryptographically-random passwords in your browser using crypto.getRandomValues — pick length, character sets and ambiguous-character exclusion.",
  faqs: [
    { q: "Is this actually random?", a: "Yes. It uses the Web Crypto API's crypto.getRandomValues, the same source browsers use for TLS keys — not Math.random." },
    { q: "Is the password sent anywhere?", a: "No. Generation is 100% local. Nothing is logged, transmitted or stored." },
    { q: "What length should I pick?", a: "For online accounts, 16+ characters with mixed sets is comfortably strong. For master passwords or crypto seeds, 20+ is recommended." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["url-encode"] = {
  summary: "URL Encoder / Decoder percent-encodes and decodes strings using JavaScript's encodeURIComponent / encodeURI so you can safely put text into query parameters and links.",
  faqs: [
    { q: "What's the difference between Component and Full URL?", a: "Component encodes every reserved character (use for a single query value). Full URL leaves URL-structural characters like : / ? # & alone (use for a whole URL you want to sanitise)." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["timestamp-converter"] = {
  summary: "Unix Timestamp Converter converts between Unix timestamps (seconds or milliseconds) and ISO 8601 / human-readable dates — with a live current-time reference.",
  faqs: [
    { q: "Seconds or milliseconds?", a: "The tool auto-detects: values with 10 or fewer digits are treated as seconds, longer values as milliseconds." },
    { q: "Does it handle time zones?", a: "The ISO output is UTC. The 'Local' line shows the same instant in your browser's time zone." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["markdown-to-html"] = {
  summary: "Markdown to HTML converts Markdown (GitHub-flavored: tables, task lists, fenced code) to clean HTML with a live preview and one-click copy or .html download.",
  faqs: [
    { q: "Which Markdown features are supported?", a: "Full CommonMark plus GFM extensions — tables, task lists, strikethrough, fenced code blocks and autolinks. Line breaks are preserved." },
    { q: "Can I paste the HTML into WordPress or Ghost?", a: "Yes. The output is standard semantic HTML that pastes into any WYSIWYG editor's HTML/source view." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["lorem-ipsum"] = {
  summary: "Lorem Ipsum Generator produces classic Lorem Ipsum placeholder text — pick paragraphs, sentences or words and copy for mockups and design work.",
  faqs: [
    { q: "Can I get plain paragraphs without 'Lorem ipsum dolor sit amet…'?", a: "Yes. Uncheck the 'Start with Lorem ipsum…' option to get randomised placeholder without the classic opening." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["text-diff"] = {
  summary: "Text Diff Checker compares two blocks of text line-by-line and highlights additions, removals and unchanged lines — a fast side-by-side diff that runs entirely in your browser.",
  faqs: [
    { q: "Is this a word-level or line-level diff?", a: "Line-level. Two lines that differ by even one character are shown as one removal and one addition." },
    { q: "Is there a size limit?", a: "No hard limit, but very large inputs (tens of thousands of lines on both sides) may slow down the browser because it uses an exact LCS diff." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["uuid-generator"] = {
  summary: "UUID Generator produces up to 1000 RFC 4122 v4 UUIDs at once using crypto.randomUUID — copy individually, copy all, or download as a .txt file.",
  faqs: [
    { q: "Which UUID version is this?", a: "Version 4 — randomly generated per RFC 4122, using the Web Crypto API's crypto.randomUUID." },
    { q: "Can I get UUIDs without hyphens?", a: "Yes — tick 'Remove hyphens' for the 32-character compact form used by some database columns." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["regex-tester"] = {
  summary: "Regex Tester lets you build and debug JavaScript regular expressions live — highlighted matches, capture groups, all six flags and a replacement preview using $1/$2 backreferences.",
  faqs: [
    { q: "Which regex dialect is this?", a: "JavaScript / ECMAScript regex (RegExp). Most PCRE features work; look-behinds, named groups and unicode escapes are supported in modern browsers." },
    { q: "Why do I get 'Nothing to repeat' or a similar error?", a: "Your pattern isn't valid JS regex — usually an unescaped special character. Fix the pattern and matches will re-run automatically." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["line-tools"] = {
  summary: "Line Sort & Dedupe cleans any list of lines — sort A→Z, Z→A or by length, remove duplicates, trim whitespace and drop blanks in one paste.",
  faqs: [
    { q: "Is the deduplication case-sensitive?", a: "Yes by default. Turn on 'Case-insensitive' to treat Apple and apple as the same line." },
    { q: "Does it keep the original order if I only dedupe?", a: "Yes. Set Sort to 'Keep original order' and only duplicates and blanks are removed." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["slugify"] = {
  summary: "Slugify turns any title or phrase into a clean, URL-safe slug — lowercased, hyphen-separated, accents removed, ready for blog posts and product pages.",
  faqs: [
    { q: "Can I keep Unicode letters (Arabic, Urdu, Chinese)?", a: "Yes — turn off 'Strict ASCII' to keep non-Latin letters, which modern browsers and search engines handle fine." },
    { q: "Can I slugify a whole list at once?", a: "Yes. Paste one title per line and every line becomes its own slug." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["jwt-decoder"] = {
  summary: "JWT Decoder base64url-decodes and pretty-prints a JSON Web Token's header and payload directly in your browser. Signatures are shown but never sent to any server or verified against a key.",
  faqs: [
    { q: "Does this verify the JWT signature?", a: "No — verifying a signature needs the issuer's secret or public key. This tool only decodes so you can inspect claims like sub, exp, iat and iss." },
    { q: "Is my token sent anywhere?", a: "No. Decoding happens entirely in your browser with atob and JSON.parse. Nothing leaves your device." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["json-yaml"] = {
  summary: "JSON ⇄ YAML Converter parses JSON or YAML in your browser and outputs the other format with proper indentation and quoting — no signup, no upload.",
  faqs: [
    { q: "Which YAML version does it support?", a: "YAML 1.2 via js-yaml, the same library used by many editors and CI tools." },
    { q: "Will comments in YAML be preserved?", a: "No — YAML → JSON → YAML round-trips drop comments because JSON has no comment syntax." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["html-to-markdown"] = {
  summary: "HTML to Markdown converts any HTML snippet into clean GitHub-flavored Markdown using Turndown, live in your browser — perfect for moving content out of CMS exports and email templates.",
  faqs: [
    { q: "Which HTML elements are supported?", a: "Headings, paragraphs, lists, blockquotes, links, images, code blocks, tables, bold/italic and horizontal rules — the standard Turndown set with GitHub-flavored options." },
    { q: "What happens to inline styles?", a: "Markdown has no style syntax, so inline CSS is dropped. Structural tags are converted; presentational ones are stripped." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["exif-remover"] = {
  summary: "Image EXIF / Metadata Remover strips EXIF, GPS location, camera model, XMP and ICC metadata from JPG, PNG or WEBP photos by re-encoding through a browser canvas — pixels stay identical, personal metadata is gone.",
  faqs: [
    { q: "Will the image quality change?", a: "For PNG output, pixels are identical. For JPG output, the file is re-encoded at quality 0.95 — visually indistinguishable in almost all cases." },
    { q: "Does it also remove GPS location?", a: "Yes. GPS coordinates live inside EXIF, which is fully stripped by the canvas re-encode." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["number-base"] = {
  summary: "Number Base Converter converts a number between binary (base 2), octal (base 8), decimal (base 10) and hexadecimal (base 16), using JavaScript BigInt so arbitrarily large values are supported.",
  faqs: [
    { q: "Is there a maximum value?", a: "No practical limit — BigInt handles thousands of digits. Very long inputs may be slow to render." },
    { q: "Does it accept the 0x / 0b / 0o prefixes?", a: "Enter just the digits — the input base you pick already tells the tool how to parse them." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["random-number"] = {
  summary: "Random Number Generator produces cryptographically-random integers in any range using crypto.getRandomValues — up to 10,000 numbers at once, unique or with repeats, uniformly distributed.",
  faqs: [
    { q: "Is this truly random?", a: "It uses the Web Crypto API's cryptographically-secure PRNG — far better than Math.random for lotteries, sampling and giveaways, and uniformly distributed (no modulo bias)." },
    { q: "What's the biggest range I can use?", a: "Any 32-bit range works. The 'Unique only' option requires the range to be at least as large as the count." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["bmi-calculator"] = {
  summary: "BMI Calculator computes Body Mass Index from height and weight in metric (cm / kg) or imperial (in / lb) units and shows the World Health Organization category label.",
  faqs: [
    { q: "What BMI counts as healthy?", a: "The WHO defines 18.5–24.9 as normal weight, under 18.5 as underweight and 25+ as overweight or obese." },
    { q: "Is BMI accurate for athletes?", a: "No — BMI doesn't distinguish muscle from fat, so muscular people can show as overweight. Use body-fat percentage instead if that applies." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["loan-calculator"] = {
  summary: "Loan / EMI Calculator computes your monthly instalment, total interest paid and a 12-month amortization schedule from loan amount, annual interest rate and term in years — instantly, in your browser.",
  faqs: [
    { q: "Which EMI formula does it use?", a: "The standard reducing-balance formula: EMI = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1), with r as the monthly rate and n as the number of months." },
    { q: "Does it work for zero-interest loans?", a: "Yes. When the rate is 0, EMI becomes principal divided by number of months." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["text-repeat"] = {
  summary: "Text Repeater & Reverser repeats any text a chosen number of times with a custom separator — supports \\n and \\t escapes and can reverse each copy for prank text or filler.",
  faqs: [
    { q: "Can I use a newline as the separator?", a: "Yes — type \\n and the tool converts it to a real line break. \\t works for tabs." },
    { q: "What's the maximum repeat count?", a: "100,000 — high enough for stress-testing text fields, low enough to keep the browser responsive." },
    ...genericFaqs.slice(1),
  ],
};

toolContent["image-to-base64"] = {
  summary: "Image ⇄ Base64 converts any image to a base64 data URL (for pasting into CSS or HTML) or decodes a base64 / data URL back into a downloadable image — done locally with the FileReader API.",
  faqs: [
    { q: "Can I paste the data URL straight into CSS?", a: "Yes. The output is a full data:image/…;base64,… URL that works in background-image, <img src>, or an HTML email." },
    { q: "Does it work on SVG?", a: "Yes — SVG encodes fine, though for CSS you may prefer inlining the SVG XML instead of base64 for smaller size." },
    ...genericFaqs.slice(1),
  ],
};

export function getToolContent(slug: string): ToolContent {
  return (
    toolContent[slug] ?? {
      summary: "",
      faqs: genericFaqs,
    }
  );
}

// --- 2026-07-26: additions for new tools ---
Object.assign(toolContent, {
  "pdf-to-csv": {
    summary:
      "PDF to CSV extracts tabular text from a text-based PDF and writes each visible row to a CSV file. Grouping is done by vertical position, so evenly-spaced tables (invoices, statements, reports) convert cleanly.",
    faqs: [
      { q: "Does it work on scanned PDFs?", a: "No — scanned PDFs are images, not text. Run them through the OCR tool first, then paste the extracted text into a spreadsheet, or convert the OCR output PDF here." },
      { q: "Why did my rows come out wrong?", a: "Multi-column layouts and merged cells are heuristic-hard. Increase the y-tolerance mentally by post-editing in Excel/Sheets, or crop each column to a single PDF first." },
      ...genericFaqs.slice(1),
    ],
  },
  "pdf-redact": {
    summary:
      "PDF Redact blacks out every occurrence of the words or phrases you enter by drawing opaque rectangles over the matched text. Runs entirely in your browser — the PDF is never uploaded.",
    faqs: [
      { q: "Is this legal-grade redaction?", a: "The rectangles are drawn on top of the original text. For legal-grade redaction where the underlying text is unrecoverable, follow up with the Compress PDF tool at any preset — it rasterizes every page, permanently baking the blackouts in." },
      { q: "Does it search inside images?", a: "No. This tool searches the selectable text layer only. For scanned pages, OCR the PDF first." },
      ...genericFaqs.slice(1),
    ],
  },
  "image-upscaler": {
    summary:
      "Image Upscaler enlarges photos 2×, 3× or 4× using multi-pass high-quality canvas scaling. It produces noticeably cleaner edges than a single stretch, without any AI model download or upload.",
    faqs: [
      { q: "Is this AI upscaling like Waifu2x or Real-ESRGAN?", a: "No. This is high-quality bicubic-style resampling done in stages, which is much lighter and works offline. It won't invent detail — expect sharpness comparable to a good Photoshop resize." },
      { q: "What formats does it accept?", a: "JPG, PNG and WebP go in; a PNG comes out to preserve transparency and avoid re-compression artifacts." },
      ...genericFaqs.slice(1),
    ],
  },
  "audio-trimmer": {
    summary:
      "Audio Trimmer decodes an MP3, WAV, M4A, OGG or WebM file in your browser and lets you cut out a selection with start/end sliders. The trimmed clip exports as a clean uncompressed WAV.",
    faqs: [
      { q: "Why WAV out and not MP3?", a: "WAV is lossless and needs no encoder — the trim happens sample-accurate with no quality loss. If you need MP3, run the WAV through the Audio / Video Converter tool afterwards." },
      { q: "Any file size limit?", a: "Practical limit is your device's memory. A 30-minute stereo MP3 decodes to roughly 300 MB of PCM data in RAM." },
      ...genericFaqs.slice(1),
    ],
  },
  "json-to-sql": {
    summary:
      "JSON to SQL turns a JSON array (or a single object) into CREATE TABLE plus INSERT INTO statements. Column types are auto-inferred (INTEGER, REAL, BOOLEAN, DATE, TEXT) from the actual values.",
    faqs: [
      { q: "Which SQL dialect does it output?", a: "Standard SQL that runs unchanged on SQLite, PostgreSQL and MySQL for typical types. Adjust BOOLEAN or DATE to your dialect if strict compatibility is needed." },
      { q: "How are nested objects handled?", a: "Nested objects and arrays are inserted as their JSON string form. Flatten your data beforehand if you want proper columns." },
      ...genericFaqs.slice(1),
    ],
  },
  "html-minifier": {
    summary:
      "HTML Minifier strips comments and collapses whitespace to shrink HTML for production. The bytes-saved counter updates live so you can compare the before and after.",
    faqs: [
      { q: "Does it minify inline CSS and JavaScript?", a: "Not aggressively — it only tightens surrounding whitespace. For dedicated inline JS/CSS minification, run those through their own tools before pasting here." },
      { q: "Will IE conditional comments be preserved?", a: "Yes — comments starting with <!--[if are kept intact." },
      ...genericFaqs.slice(1),
    ],
  },
  "css-beautify": {
    summary:
      "CSS Beautifier re-indents minified or messy CSS with one declaration per line and proper nesting for media queries and selector blocks. Runs instantly, entirely in your browser.",
    faqs: [
      { q: "Does it understand SCSS or Less?", a: "It handles the CSS subset (nested rules will format visually but syntax-specific features are not validated). For SCSS, use the source-side formatter in your editor." },
      { q: "Is my code sent anywhere?", a: "No. Everything runs in the tab — the site never sees your stylesheet." },
      ...genericFaqs.slice(1),
    ],
  },
  "mock-data": {
    summary:
      "Mock Data Generator produces realistic fake rows — names, emails, phone numbers, UUIDs, cities, dates, booleans — from column definitions you set. Up to 10,000 rows, exported as JSON or CSV.",
    faqs: [
      { q: "Is the data really random?", a: "Yes — every value is generated fresh on click using Math.random(). Emails don't correspond to real inboxes; they use the reserved example.com domain." },
      { q: "Can I add my own column type?", a: "Not yet — the built-in types cover the common cases. Post-process the output in a spreadsheet if you need custom columns." },
      ...genericFaqs.slice(1),
    ],
  },
  "sql-formatter": {
    summary:
      "SQL Formatter uppercases keywords and puts each major clause on its own line (FROM, WHERE, JOIN, GROUP BY, HAVING, ORDER BY, UNION). Works on SELECT, INSERT, UPDATE and DELETE.",
    faqs: [
      { q: "Does it validate my SQL?", a: "No — this is a pure formatter, not a linter. It won't catch a missing comma; it'll just format what you give it." },
      { q: "Vendor-specific syntax like Postgres arrays?", a: "Formatted as ordinary text — the tool doesn't parse vendor extensions but won't break them either." },
      ...genericFaqs.slice(1),
    ],
  },
  "yaml-formatter": {
    summary:
      "YAML Formatter parses your YAML with a real parser (js-yaml), validates it, and re-dumps it with clean 2-space indentation. Syntax errors surface the exact line as you type.",
    faqs: [
      { q: "Which YAML version?", a: "YAML 1.2 via js-yaml. Handles anchors, aliases, block and flow styles." },
      { q: "Does it preserve comments?", a: "No — YAML parsers throw away comments during load. If you need comment-preserving reformatting, use an editor plugin instead." },
      ...genericFaqs.slice(1),
    ],
  },
});

// --- 2026-07-27: open-source AI tools ---
Object.assign(toolContent, {
  "ai-summarizer": {
    summary:
      "AI Text Summarizer runs Hugging Face's open-source DistilBART-CNN model directly in your browser via transformers.js. Paste any article, email or transcript and get a concise abstractive summary — the text never leaves your device.",
    faqs: [
      { q: "Which model does it use?", a: "Xenova/distilbart-cnn-6-6, an open-source distilled BART fine-tuned on the CNN/DailyMail news dataset. Runs locally via @huggingface/transformers." },
      { q: "How big is the download?", a: "Around 150 MB on the first run. It's cached in your browser after that, so subsequent summaries are instant." },
      { q: "What language does it support?", a: "DistilBART-CNN is English-only. For other languages, paste an English translation first." },
      { q: "Is my text uploaded anywhere?", a: "No. Once the model is downloaded, inference happens 100% in your browser — your text is never sent to a server." },
      ...genericFaqs.slice(1),
    ],
  },
  "ai-image-caption": {
    summary:
      "AI Image Caption Generator describes any photo in plain English using the open-source ViT-GPT2 vision-language model. Runs in your browser via transformers.js — great for accessibility alt text or quick auto-tagging.",
    faqs: [
      { q: "Which model is used?", a: "Xenova/vit-gpt2-image-captioning — a Vision Transformer encoder paired with GPT-2 for caption decoding, ported to run in the browser." },
      { q: "How long is the caption?", a: "One short sentence. It's an image caption model, not a detailed image describer — for longer descriptions, use it as a starting point." },
      { q: "Is the image uploaded?", a: "No. The image is processed entirely on your device after the one-time ~180 MB model download." },
      ...genericFaqs.slice(1),
    ],
  },
  "ai-transcribe": {
    summary:
      "AI Speech-to-Text transcribes audio and video with OpenAI's open-source Whisper model running locally in your browser via transformers.js. Supports 90+ languages, no signup, no upload — your recording never leaves your device.",
    faqs: [
      { q: "Which Whisper version?", a: "Xenova/whisper-tiny (multilingual). Around 80 MB, fast enough for real-time on most laptops. For higher accuracy, we may add whisper-base / small in a future update." },
      { q: "What file types work?", a: "Anything the browser can decode: MP3, WAV, M4A, AAC, OGG, FLAC, WebM and MP4 video (audio track is extracted automatically)." },
      { q: "How accurate is it?", a: "Whisper-tiny is good for clean speech in the supported languages. For noisy audio, heavy accents or long recordings, larger Whisper models (not yet shipped here) do better." },
      { q: "Is my audio uploaded?", a: "No. Audio is decoded and transcribed 100% locally in your browser after the one-time model download." },
      ...genericFaqs.slice(1),
    ],
  },
  "ai-upscale": {
    summary:
      "AI Image Upscaler enlarges photos 2× with a real Swin2SR super-resolution neural network — running in your browser via transformers.js. Produces genuinely reconstructed detail rather than a plain stretch.",
    faqs: [
      { q: "Which model does it use?", a: "Xenova/swin2SR-classical-sr-x2-64, an open-source Swin Transformer for image restoration published at ECCV 2022." },
      { q: "Why is input capped at 512 px?", a: "Swin2SR is compute-heavy — inputs are auto-resized down to 512 px on the long side so the browser can finish in a reasonable time. The output is then 2× that." },
      { q: "How does this compare to the plain Image Upscaler?", a: "The other upscaler uses fast multi-pass canvas scaling — no download, no AI, works instantly. This one uses a real neural network that reconstructs detail, at the cost of a 50 MB one-time model download and slower processing." },
      { q: "Is my image uploaded?", a: "No. The upscaling runs entirely on your device after the one-time model download." },
      ...genericFaqs.slice(1),
    ],
  },
});
