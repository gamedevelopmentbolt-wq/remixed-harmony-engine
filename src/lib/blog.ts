export type BlogLang = "en" | "fr" | "de" | "ar";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** 1–2 sentence direct answer surfaced near the top of the page for AI answer engines. */
  summary?: string;
  date: string; // ISO
  /** ISO date of the last substantive edit. Falls back to `date` when omitted. */
  updated?: string;
  readMinutes: number;
  tags: string[];
  /** ISO language code. Defaults to "en" when omitted. */
  lang?: BlogLang;
  /** Sibling posts covering the same topic in other languages, used for hreflang alternates and the language switcher. */
  translations?: { lang: BlogLang; slug: string }[];
  hero: { src: string; alt: string };
  /**
   * Body is rendered by the detail route which understands a small
   * whitelist of block types. Keeps content in plain data — no MDX runtime.
   */
  body: BlogBlock[];
  faqs?: { q: string; a: string }[];
  cta: { toolSlug: string; heading: string; body: string };
  sources: { label: string; href: string }[];
}

export type BlogBlock =
  | { type: "p"; html: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "figure"; src: string; alt: string; caption?: string }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string };

export const posts: BlogPost[] = [
  {
    slug: "json-formatter-validator-guide",
    title: "JSON Formatter & Validator: Free Online Guide (2026)",
    description:
      "What JSON formatting and validation actually do, the syntax errors they catch, and a step-by-step walkthrough of formatting, minifying and validating JSON in your browser.",
    summary:
      "A JSON formatter re-indents machine-written JSON so humans can read it; a validator parses it and tells you exactly where the syntax breaks. EasyFileMagic's JSON Formatter does both in your browser — it pretty-prints or minifies, and reports invalid JSON with the offending line and column. Nothing is uploaded.",
    date: "2026-08-12",
    readMinutes: 8,
    tags: ["Developer", "How-to", "Data"],
    hero: {
      src: "/blog/blog-json-format-hero.jpg",
      alt: "An indented JSON document in a code pane with a syntax error highlighted on one line.",
    },
    body: [
      { type: "p", html: 'JSON is written by machines and read by people, and those two audiences want opposite things. A server wants the smallest possible payload — one line, no spaces. You want to see the shape of the object: which keys are nested where, whether that array has three items or three hundred, and why the parser is refusing to accept it. A formatter and a validator solve both halves of that problem, and our <a href="/tools/json-format" class="text-signal underline underline-offset-2">JSON Formatter &amp; Validator</a> does them in the same pass.' },

      { type: "h2", id: "what-it-does", text: "What formatting and validating actually do" },
      { type: "p", html: "Two distinct operations, usually bundled into one tool:" },
      { type: "ul", items: [
        "<strong>Validating</strong> — the text is parsed against the JSON grammar. Either it parses, in which case it is valid JSON, or it fails at a specific character and you get an error pointing at that spot.",
        "<strong>Formatting (pretty-printing)</strong> — the parsed structure is written back out with consistent indentation and line breaks, so nesting is visible at a glance.",
        "<strong>Minifying</strong> — the same structure written back with all optional whitespace stripped, which is what you want before shipping a payload, embedding JSON in a config value, or measuring real transfer size.",
      ] },
      { type: "p", html: "Because formatting requires a successful parse first, a tool that formats your input has implicitly validated it. If it will not format, the JSON is broken — and the error message is the useful output." },

      { type: "h2", id: "why", text: "When you actually need it" },
      { type: "ul", items: [
        "<strong>Reading an API response.</strong> A one-line response body from <code>curl</code> or a webhook log becomes navigable the moment it is indented.",
        "<strong>Debugging a failing request.</strong> Before blaming the API, confirm the body you are sending is valid JSON at all — a trailing comma is a 400 waiting to happen.",
        "<strong>Reviewing config files.</strong> <code>package.json</code>, <code>tsconfig.json</code>, CI manifests and cloud policy documents are all JSON, and all easier to diff when consistently indented.",
        "<strong>Shrinking a payload.</strong> Minifying before you embed JSON in an environment variable, a query string or a database column keeps it compact.",
        "<strong>Inspecting exported data.</strong> Analytics exports, database dumps and log bundles frequently arrive as dense JSON files.",
      ] },

      { type: "h2", id: "errors", text: "Common errors a validator catches" },
      { type: "p", html: "JSON is a deliberately small grammar, so the mistakes are predictable. These are the ones that account for nearly every parse failure:" },
      {
        type: "table",
        headers: ["Mistake", "Example", "Why it fails"],
        rows: [
          ["Trailing comma", '<code>{"a": 1, "b": 2,}</code>', "Legal in JavaScript and in JSON5, but not in JSON. A value must follow every comma."],
          ["Single quotes", "<code>{'a': 1}</code>", "JSON strings and keys must use double quotes."],
          ["Unquoted keys", '<code>{a: 1}</code>', "Object keys are strings, so they always need quotes — this is where JavaScript object literals and JSON diverge."],
          ["Comments", '<code>{ // note\\n "a": 1 }</code>', "JSON has no comment syntax. Strip them, or use a format such as JSONC or YAML that allows them."],
          ["Unescaped characters", '<code>{"path": "C:\\\\new"}</code>', "Backslashes, literal newlines and unescaped double quotes inside a string must be escaped."],
          ["NaN, Infinity, undefined", '<code>{"n": NaN}</code>', "Not part of the JSON number grammar. Use null, or a string, or a sentinel number."],
          ["Missing bracket or brace", '<code>{"a": [1, 2}</code>', "Every opener needs its matching closer — the classic error from hand-editing a large file."],
          ["Truncated payload", "response cut mid-object", "Usually a size limit or a dropped connection rather than a syntax bug, but the parser reports it as unexpected end of input."],
        ],
        caption: "The eight failures behind the overwhelming majority of 'invalid JSON' messages.",
      },
      { type: "p", html: "One thing a validator will <em>not</em> tell you: whether the JSON means what you intended. Valid syntax with the wrong key names, wrong types or missing fields parses perfectly. That is a schema question, not a syntax one." },

      { type: "h2", id: "how-to", text: "How to use the EasyFileMagic JSON Formatter" },
      { type: "p", html: 'The tool runs entirely in your browser using the built-in <code>JSON.parse</code> and <code>JSON.stringify</code>, so API keys, customer records and internal payloads never leave your device.' },
      { type: "ol", items: [
        'Open the <a href="/tools/json-format" class="text-signal underline underline-offset-2">JSON Formatter &amp; Validator</a>.',
        "Paste your JSON into the input box, or drop a <code>.json</code> file onto the upload area to load its contents.",
        "Choose <strong>Pretty print</strong> or <strong>Minify</strong>. In pretty-print mode you can set the indent to 2, 4 or 8 spaces.",
        "Press <strong>Format</strong> (or <strong>Minify</strong>). Valid input produces the result plus a confirmation showing the output length in characters.",
        "If the input is invalid, you get the parser message together with the exact <strong>line and column</strong> of the failure — go to that spot in your source and the cause is almost always visible within a character or two.",
        "Use <strong>Copy</strong> to put the result on your clipboard, or <strong>Download</strong> to save it as <code>formatted.json</code>.",
      ] },
      { type: "h3", id: "related", text: "Related tools" },
      { type: "p", html: 'Working with the same data in another shape? <a href="/tools/json-yaml" class="text-signal underline underline-offset-2">JSON ⇄ YAML</a> converts between the two formats, <a href="/tools/csv-json" class="text-signal underline underline-offset-2">CSV ⇄ JSON</a> handles tabular exports, <a href="/tools/json-to-sql" class="text-signal underline underline-offset-2">JSON to SQL</a> turns records into insert statements, and the <a href="/tools/jwt-decoder" class="text-signal underline underline-offset-2">JWT Decoder</a> unpacks a token into its JSON claims. For epoch fields inside a payload, pair it with the <a href="/tools/timestamp-converter" class="text-signal underline underline-offset-2">Unix Timestamp Converter</a>.' },
    ],
    faqs: [
      { q: "What does a JSON formatter do?", a: "It parses your JSON and writes it back out with consistent indentation and line breaks so the structure is readable. Because it must parse the input first, it also acts as a validator: if it cannot format the text, the JSON is invalid." },
      { q: "How do I find the error in invalid JSON?", a: "Use a validator that reports a position. Our tool converts the parser's character offset into a line and column number, so you can jump straight to the failing character in your source file." },
      { q: "Why is a trailing comma invalid in JSON?", a: "The JSON grammar requires a value after every comma. Trailing commas are allowed in JavaScript object literals and in relaxed formats like JSON5, which is why the mistake is so common — but a strict JSON parser rejects them." },
      { q: "Can JSON contain comments?", a: "No. The JSON specification has no comment syntax. If you need comments in a config file, use JSONC, YAML or TOML, and strip comments before parsing the file as JSON." },
      { q: "Is minified JSON different data?", a: "No. Minifying only removes optional whitespace between tokens. The parsed structure — keys, values, types and order of array items — is identical." },
      { q: "Is my JSON uploaded to a server?", a: "No. Formatting, minifying and validation all run in your browser with the standard JSON API. Nothing is transmitted, logged or stored, so it is safe to paste production payloads." },
      { q: "Is there a size limit?", a: "There is no server quota because there is no server. The practical limit is your device's memory and how fast your browser renders a very large document in a text area." },
    ],
    cta: { toolSlug: "json-format", heading: "Format and validate your JSON now", body: "Pretty-print with your chosen indent, minify, or find the exact line and column of a syntax error — free, no signup, and your data never leaves your browser." },
    sources: [
      { label: "ECMA-404 — The JSON Data Interchange Syntax", href: "https://www.ecma-international.org/publications-and-standards/standards/ecma-404/" },
      { label: "RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format", href: "https://www.rfc-editor.org/rfc/rfc8259" },
      { label: "MDN — JSON.parse()", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" },
    ],
  },
  {
    slug: "password-generator-security-guide",
    title: "Strong Password Generator: How to Create Secure Passwords (2026)",
    description:
      "Why length beats complexity, what entropy really measures, why password reuse is the biggest risk, and how to generate a strong random password in your browser.",
    summary:
      "A strong password is long and randomly generated, and used on exactly one account. EasyFileMagic's Password Generator builds passwords of 4–64 characters from the sets you choose using the browser's cryptographic random number generator — nothing is sent to a server or stored anywhere.",
    date: "2026-08-12",
    readMinutes: 8,
    tags: ["Security", "How-to", "Developer"],
    hero: {
      src: "/blog/blog-password-generator-hero.jpg",
      alt: "A padlock next to a masked password field and a password strength meter.",
    },
    body: [
      { type: "p", html: 'Most advice about passwords is a decade out of date: mix in a symbol, swap an "o" for a zero, change it every 90 days. Modern guidance from bodies such as NIST has moved in a different direction — favour length, favour randomness, stop forcing arbitrary rotation, and screen against known-breached passwords. This guide explains what actually makes a password hard to guess, and how to produce one with our <a href="/tools/password-generator" class="text-signal underline underline-offset-2">Password Generator</a>.' },

      { type: "h2", id: "what-makes-strong", text: "What makes a password strong" },
      { type: "h3", id: "randomness", text: "Randomness comes first" },
      { type: "p", html: "A password is only as strong as the process that produced it. A human-chosen password follows human patterns — a word, a capital at the front, a number and an exclamation mark at the end — and cracking tools model those patterns directly. A password drawn character by character from a random source has no pattern to model, which is the whole point of using a generator rather than your imagination." },
      { type: "h3", id: "length", text: "Length beats complexity" },
      { type: "p", html: "Adding one character to a random password multiplies the number of possibilities by the size of the alphabet. Adding one more symbol type to a short password only widens the alphabet slightly. Given a choice between a 10-character password with every character class and a 20-character lowercase-and-digit password, the longer one is dramatically harder to brute force." },
      { type: "h3", id: "entropy", text: "Entropy, in plain terms" },
      { type: "p", html: "Entropy is a measure, in bits, of how many equally likely possibilities a random password was drawn from. Each extra bit doubles the search space. For a password of <em>L</em> characters chosen uniformly from an alphabet of <em>N</em> symbols, the entropy is <em>L × log₂(N)</em>." },
      {
        type: "table",
        headers: ["Alphabet", "Bits per character", "16 characters", "20 characters"],
        rows: [
          ["Digits only (10)", "3.32", "≈ 53 bits", "≈ 66 bits"],
          ["Lowercase only (26)", "4.70", "≈ 75 bits", "≈ 94 bits"],
          ["Upper + lower + digits (62)", "5.95", "≈ 95 bits", "≈ 119 bits"],
          ["All four sets (~86)", "6.43", "≈ 103 bits", "≈ 129 bits"],
        ],
        caption: "Entropy of a uniformly random password. These figures only hold when the characters are genuinely random — a memorised phrase dressed up with symbols has far less entropy than its length suggests.",
      },
      { type: "p", html: "The practical takeaway: anything above roughly 80 bits of true entropy is beyond offline brute force with any foreseeable hardware, and the generator's default of 20 characters across all four sets comfortably exceeds that. Beyond that point the weak link is never the password's maths — it is reuse, phishing, and where the password is stored." },
      { type: "h3", id: "reuse", text: "Never reuse a password" },
      { type: "p", html: "This is the single most important rule, and it is why generated passwords need a manager rather than a memory. When any site is breached, the leaked credentials are replayed against other services automatically — an attack known as credential stuffing. A unique password per account turns one site's bad day into one account's problem. A reused password turns it into all of them." },
      { type: "h3", id: "habits", text: "The rest of the checklist" },
      { type: "ul", items: [
        "Use a password manager so every account can have a different long random string you never need to type from memory.",
        "Turn on two-factor authentication wherever it is offered; an app-based or hardware key factor is stronger than SMS.",
        "Change a password when there is a reason to — a breach notice, a shared device, a suspicion — rather than on a fixed schedule.",
        "Keep a handful of memorable passphrases only for the secrets that unlock everything else, such as your password manager and your device login.",
        "Never send a password over email or chat; share credentials through your manager's sharing feature instead.",
      ] },

      { type: "h2", id: "how-to", text: "How to use the EasyFileMagic Password Generator" },
      { type: "p", html: 'The generator uses <code>crypto.getRandomValues</code>, the browser\'s cryptographically secure random number generator — not <code>Math.random</code>. Everything happens on your device: the password is never transmitted, logged or saved, and reloading the page discards it.' },
      { type: "ol", items: [
        'Open the <a href="/tools/password-generator" class="text-signal underline underline-offset-2">Password Generator</a>. A password appears immediately, at the default length of 20 characters with all four character sets enabled.',
        "Drag the <strong>length</strong> slider to anything from 4 to 64 characters. Longer is stronger; match the site's maximum if it enforces one.",
        "Tick the character sets you want: lowercase, uppercase, digits and symbols. The generator guarantees at least one character from every set you enable, then fills the rest from the combined pool and shuffles the result.",
        "Enable <strong>exclude ambiguous characters</strong> if the password will be read aloud or typed by hand — it removes the easily confused I, l, 1, O, 0 and o at a small cost in entropy.",
        "Watch the <strong>strength meter</strong> update as you change options. It scores length and the variety of character classes present.",
        "Press <strong>New</strong> for a different password, or <strong>Copy</strong> to put it on your clipboard — then paste it straight into your password manager before you navigate away.",
      ] },
      { type: "h3", id: "after", text: "After you generate" },
      { type: "p", html: 'Save the password into a manager immediately; the tool deliberately keeps no history. If you need a one-way fingerprint of a string rather than a secret to store, our <a href="/tools/hash-text" class="text-signal underline underline-offset-2">Hash Text</a> tool computes SHA hashes locally, and <a href="/tools/uuid-generator" class="text-signal underline underline-offset-2">UUID Generator</a> is the right tool for random identifiers that are not secrets.' },

      { type: "h2", id: "privacy", text: "Why an in-browser generator matters here" },
      { type: "p", html: "A password generated on someone else's server is a password that existed, however briefly, on someone else's machine. There is rarely any reason to accept that risk: generating random characters needs no server-side capability at all. Our generator runs in the page, works offline once loaded, requires no account, and produces nothing that is stored anywhere — which is exactly the standard you should hold any password tool to." },
    ],
    faqs: [
      { q: "How long should a password be?", a: "For an account you protect with a password manager, 16 to 20 randomly generated characters is a sensible default and is far beyond offline brute-force reach. Go longer where the site allows it; never go below 12 for anything that matters." },
      { q: "Is length or complexity more important?", a: "Length. Each additional character multiplies the number of possible passwords, while adding a character class only widens the alphabet slightly. A long random password beats a short one packed with symbols." },
      { q: "What is password entropy?", a: "It is the number of bits needed to describe how many equally likely possibilities a random password was drawn from, calculated as length multiplied by log2 of the alphabet size. Each extra bit doubles the work an attacker must do." },
      { q: "Why should I never reuse passwords?", a: "Because leaked credentials from one breached site are automatically replayed against other services — credential stuffing. A unique password per account contains the damage to the one site that was actually breached." },
      { q: "Are the generated passwords truly random?", a: "They are produced with crypto.getRandomValues, the browser's cryptographically secure random number generator, rather than Math.random. Characters are drawn from the sets you enable and then shuffled." },
      { q: "Is the password sent to a server?", a: "No. Generation happens entirely in your browser, nothing is transmitted or stored, and the password disappears when you close or reload the page." },
      { q: "Should I exclude ambiguous characters?", a: "Only when a human will read or retype the password — it removes I, l, 1, O, 0 and o to prevent mistakes. It slightly shrinks the alphabet, which you can offset by adding a character or two of length." },
      { q: "How often should I change my passwords?", a: "Modern guidance favours changing a password when there is evidence it may be compromised, rather than on a fixed schedule. Forced rotation tends to push people toward predictable variations of an old password." },
    ],
    cta: { toolSlug: "password-generator", heading: "Generate a strong password now", body: "Pick your length and character sets and get a cryptographically random password instantly — free, no signup, generated in your browser and never stored." },
    sources: [
      { label: "NIST SP 800-63B — Digital Identity Guidelines: Authenticator and Verifier Requirements", href: "https://pages.nist.gov/800-63-3/sp800-63b.html" },
      { label: "MDN — Crypto.getRandomValues()", href: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues" },
      { label: "OWASP — Authentication Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
      { label: "NCSC — Password policy: updating your approach", href: "https://www.ncsc.gov.uk/collection/passwords/updating-your-approach" },
    ],
  },
  {
    slug: "free-online-pdf-editor-guide-2026",
    title: "Free Online PDF Editor: Complete Guide (2026)",
    description:
      "What a browser-based PDF editor can and cannot do — add text, annotate, fill forms, sign, reorder pages — plus the privacy difference between in-browser and upload-based editors.",
    summary:
      "A browser-based PDF editor lets you add text, highlights, drawings, images and signatures on top of an existing PDF without installing software. EasyFileMagic's PDF Editor does all of that inside your browser tab using pdf.js and pdf-lib — the file is never uploaded, there is no account and no watermark.",
    date: "2026-08-11",
    readMinutes: 9,
    tags: ["PDF", "How-to", "Privacy"],
    hero: {
      src: "/blog/blog-pdf-editor-hero.jpg",
      alt: "A PDF page annotated with a highlight, a signature, a text box and a sticky note.",
    },
    body: [
      { type: "p", html: 'PDF was designed to look identical everywhere, which is exactly why it is awkward to change. There are no paragraphs to retype — just glyphs, images and vector shapes placed at fixed coordinates. A "PDF editor" therefore does one of two things: it rebuilds the page (hard, lossy, expensive) or it lets you place new content on top of the page and saves the result (fast, reliable, and what almost everyone actually needs). This guide covers what the second approach gets you, where it stops, and exactly how to do it with our <a href="/tools/pdf-editor" class="text-signal underline underline-offset-2">PDF Editor</a>.' },

      { type: "h2", id: "what-you-can-do", text: "What you can do with a browser-based PDF editor" },
      { type: "p", html: "Everything below is in the EasyFileMagic PDF Editor today — this is a description of the tool, not a wishlist." },
      { type: "h3", id: "add-text", text: "Add text" },
      { type: "p", html: "Switch to the Text tool and click anywhere on the page to drop an editable text box. You can set the size and pick from Helvetica, Times New Roman, Courier New, Arial, Georgia or Verdana, plus a colour. This is how you complete a form that has no interactive fields, add a date, correct a name, or annotate a draft." },
      { type: "h3", id: "annotate", text: "Annotate and mark up" },
      { type: "ul", items: [
        "<strong>Draw</strong> — freehand pen at an adjustable stroke width, for circling and ticking.",
        "<strong>Highlight</strong> — a translucent marker stroke over existing text.",
        "<strong>Note</strong> — a sticky-note style callout for comments.",
        "<strong>Rect, Ellipse, Line</strong> — shapes for boxing a clause or pointing at a figure.",
        "<strong>Whiteout</strong> — an opaque block that covers content visually. Useful for tidying a page, but see the redaction warning below.",
        "<strong>Image</strong> — place a logo, stamp or photo and scale it in place.",
      ] },
      { type: "p", html: "There is an undo/redo history (up to 100 steps), an optional grid, and snap-to-grid if you want annotations aligned rather than approximately placed." },
      { type: "h3", id: "fill-forms", text: "Fill in forms" },
      { type: "p", html: "Worth being precise here, because most tools are vague about it. Our editor does not detect interactive AcroForm fields and does not populate them. What it does is let you type text exactly where the field is and save that into the page. For the overwhelming majority of real forms — a scanned application, a PDF that was never made interactive, a landlord's tenancy form — that is the same outcome: a filled, printable, emailable PDF. If you specifically need saved <em>interactive</em> field values, use a desktop reader that supports form filling." },
      { type: "h3", id: "sign", text: "Sign a document" },
      { type: "p", html: 'The signature dialog gives you two routes: draw your signature with a mouse, trackpad or finger, or type it and pick a script-like font (Georgia and friends). Either way it is placed as a transparent image you can drag and resize onto the signature line. If signing is the only thing you need, <a href="/tools/sign-pdf" class="text-signal underline underline-offset-2">Sign PDF</a> is the shorter path. Note that this is a visible, drawn signature — not a cryptographic digital signature with a certificate.' },
      { type: "h3", id: "pages", text: "Reorganise pages, watermark, number" },
      { type: "ul", items: [
        "Reorder pages by moving them up or down in the thumbnail strip, rotate any page in 90° steps, or delete pages you do not want.",
        "Insert pages from another PDF, or add a blank page.",
        "Export the current page on its own as a one-page PDF.",
        "Apply a diagonal watermark across the document with your own text, colour, size, angle and opacity.",
        "Add page numbers in any of six corner/centre positions, with a custom format such as <code>{n} / {total}</code> and a chosen starting number.",
      ] },
      { type: "p", html: 'Doing only one of those? The single-purpose tools are quicker: <a href="/tools/pdf-organize" class="text-signal underline underline-offset-2">Organize PDF</a>, <a href="/tools/watermark-pdf" class="text-signal underline underline-offset-2">Watermark PDF</a>, <a href="/tools/page-numbers-pdf" class="text-signal underline underline-offset-2">Page Numbers</a> and <a href="/tools/merge-pdf" class="text-signal underline underline-offset-2">Merge PDF</a>.' },

      { type: "h2", id: "limits", text: "What it cannot do (and what to use instead)" },
      { type: "ul", items: [
        "<strong>Retype existing text.</strong> Original page content is preserved exactly as it was; you add on top of it. To change a sentence, whiteout the old line and type the new one — or convert to Word with <a href=\"/tools/pdf-word\" class=\"text-signal underline underline-offset-2\">PDF ⇄ Word</a>, edit there, and export back to PDF.",
        "<strong>Redact securely.</strong> Whiteout hides content visually; the underlying text is still copied into the exported file. For genuine removal use <a href=\"/tools/pdf-redact\" class=\"text-signal underline underline-offset-2\">Redact PDF</a>, which is built for that.",
        "<strong>Read a scanned page.</strong> A scan is a picture. You can annotate it, but there is no text to work with until you run <a href=\"/tools/ocr\" class=\"text-signal underline underline-offset-2\">OCR</a>.",
        "<strong>Edit a password-protected PDF.</strong> Remove the restriction first with the password you own; to add protection, use <a href=\"/tools/protect-pdf\" class=\"text-signal underline underline-offset-2\">Protect PDF</a>.",
      ] },

      { type: "h2", id: "privacy", text: "Privacy: in-browser editing vs upload-based editors" },
      { type: "p", html: "This is the part worth reading before you pick any PDF editor, ours included. The documents people most want to edit — contracts, payslips, medical letters, ID scans, signed agreements — are precisely the documents you should think twice about uploading." },
      {
        type: "table",
        headers: ["", "In-browser editor (EasyFileMagic PDF Editor)", "Upload-based editor"],
        rows: [
          ["Where the file goes", "Stays in the browser tab; it is read from your disk into memory and never transmitted", "Uploaded to the provider's servers, processed there, downloaded back"],
          ["Who can see it", "Only you and your device", "The provider, its hosting stack, and anyone with access to it during the retention window"],
          ["Retention policy", "Not applicable — nothing is stored anywhere but your machine", "Governed by the provider's policy; typically deleted after a set number of hours"],
          ["File size limit", "Bounded by your device's memory, not a server quota", "Usually capped on free tiers"],
          ["Daily usage limit", "None — there is no server to meter", "Commonly metered per day or per hour"],
          ["Works offline", "Once the page has loaded, yes", "No"],
        ],
        caption: "The EasyFileMagic column describes the tool's actual implementation: pdf.js renders pages, Fabric.js handles the annotation layer, pdf-lib writes the output, all in your browser.",
      },
      { type: "p", html: 'None of this means hosted editors are bad — server-side processing buys real capabilities, such as full text reflow, that a browser cannot easily match. It means the decision should be made per document. For anything confidential, local processing removes the question entirely. We wrote about the general trade-off in <a href="/blog/browser-based-file-processing-is-it-safe" class="text-signal underline underline-offset-2">Browser-based file processing: is it safe?</a>' },

      { type: "h2", id: "how-to", text: "Step by step: editing a PDF with EasyFileMagic" },
      { type: "ol", items: [
        'Open the <a href="/tools/pdf-editor" class="text-signal underline underline-offset-2">PDF Editor</a>. There is no signup and nothing to install.',
        "Drop in one PDF, or click to browse. It loads and renders locally; large files are fine because there is no upload step.",
        "Pick a tool from the toolbar — Select, Text, Draw, Highlight, Whiteout, Note, Rect, Ellipse, Line or Image — then choose a colour, stroke width or font size for it.",
        "Click or drag on the page to place your edit. Use Select to move, resize and rotate anything you have added, and undo/redo to step back and forth.",
        "Use the page thumbnails on the side to move, rotate, delete or insert pages, and the bulk actions for a watermark or page numbers.",
        "Add a signature from the signature dialog: draw it or type it, then drag it onto the signature line.",
        "Click Export. Your original pages are copied through unchanged and your edits are baked on as a high-resolution overlay; the file downloads as <code>yourfile-edited.pdf</code>.",
      ] },
      { type: "p", html: "One detail about export, because it matters for some workflows: the original page content is copied as-is, so existing text stays selectable and searchable. Your added annotations are flattened into the page as a transparent high-DPI image layer, so they are permanent and render identically everywhere — but they are not selectable text and cannot be un-annotated by the recipient. For signed and finalised documents that is usually exactly what you want." },
      { type: "p", html: 'Exported file feeling heavy after a lot of markup? Run it through <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a> before sending.' },
    ],
    faqs: [
      { q: "Is the EasyFileMagic PDF Editor really free?", a: "Yes. There is no account, no email, no watermark on the output and no daily limit. The editing runs in your browser, so there is no server cost to recover." },
      { q: "Is my PDF uploaded to a server?", a: "No. The file is read from your device into the browser tab. Pages are rendered with pdf.js, edits are handled on a canvas layer, and the final PDF is written with pdf-lib — all locally. Nothing is transmitted." },
      { q: "Can I edit the existing text in a PDF?", a: "Not directly. The editor preserves the original page and lets you add content on top. To change existing wording, cover the old text with the Whiteout tool and type the replacement, or convert the PDF to Word, edit it there, and export back to PDF." },
      { q: "Can I fill in a PDF form?", a: "Yes, by typing text where the fields are and exporting. The tool does not detect or save interactive AcroForm field values — it places your text onto the page, which produces a filled PDF suitable for printing or emailing." },
      { q: "Is a drawn signature legally valid?", a: "In many jurisdictions a signature applied electronically to a document can be legally binding, but the requirements vary by country and by document type, and some agreements require a certificate-based digital signature. This tool produces a visible drawn or typed signature, not a cryptographic one — check the rules that apply to your document." },
      { q: "Is there a file size limit?", a: "We impose none. The practical limit is your device's memory, so a desktop handles much larger documents than a phone." },
      { q: "Can I hide sensitive information with the Whiteout tool?", a: "Only visually. The covered text still exists in the exported file and can be copied out. Use the dedicated Redact PDF tool when the information must genuinely be removed." },
    ],
    cta: { toolSlug: "pdf-editor", heading: "Edit your PDF in the browser", body: "Add text, highlights, shapes, images and signatures, reorder pages, watermark and number — free, no signup, and your file never leaves your device." },
    sources: [
      { label: "Adobe — PDF (Portable Document Format) overview", href: "https://www.adobe.com/acrobat/about-adobe-pdf.html" },
      { label: "ISO 32000-1 — Document management: Portable Document Format", href: "https://www.iso.org/standard/51502.html" },
      { label: "Mozilla pdf.js — PDF rendering in the browser", href: "https://mozilla.github.io/pdf.js/" },
      { label: "pdf-lib — create and modify PDF documents in JavaScript", href: "https://pdf-lib.js.org/" },
    ],
  },
  {
    slug: "unix-timestamp-converter-guide",
    title: "Unix Timestamp Converter: What It Is and How to Use It",
    description:
      "What a Unix timestamp is, why seconds and milliseconds get confused, where developers meet epoch time in logs, APIs and databases, and how to convert it instantly in your browser.",
    summary:
      "A Unix timestamp is the number of seconds elapsed since 00:00:00 UTC on 1 January 1970, ignoring leap seconds. EasyFileMagic's Unix Timestamp Converter turns it into an ISO 8601 or human-readable date (and back) instantly in your browser, auto-detecting whether your value is in seconds or milliseconds.",
    date: "2026-08-11",
    readMinutes: 8,
    tags: ["Data", "How-to", "Developers"],
    hero: {
      src: "/blog/blog-timestamp-hero.jpg",
      alt: "A clock face with an arrow pointing to a calendar page, representing epoch time converted to a date.",
    },
    body: [
      { type: "p", html: 'You are reading a log line, an API response or a database row and there it is: <code>1767225600</code>. It is a date, but not one you can read. This guide explains what that number is, the traps that make it go wrong, and how to convert it in a second with our <a href="/tools/timestamp-converter" class="text-signal underline underline-offset-2">Unix Timestamp Converter</a>.' },

      { type: "h2", id: "what-is-it", text: "What a Unix timestamp is" },
      { type: "p", html: 'A Unix timestamp — also called epoch time, POSIX time or Unix time — is the number of seconds that have elapsed since <strong>00:00:00 UTC on 1 January 1970</strong>, known as the Unix epoch. Negative values represent instants before that date.' },
      { type: "p", html: "Two properties make it the default way machines store time. First, it is a single integer: trivially comparable, sortable and subtractable, with no parsing needed. Second, it carries no time zone, because it is always counted in UTC — the same instant produces the same number everywhere on Earth. Formatting into a local date is a display concern, applied at the last possible moment." },
      { type: "p", html: "POSIX time also ignores leap seconds by definition: a day is treated as exactly 86,400 seconds. That keeps the arithmetic simple at the cost of being a few dozen seconds away from strict atomic time — irrelevant for almost every application, and a known consideration for the handful where it is not." },
      { type: "h3", id: "2038", text: "The year 2038 problem" },
      { type: "p", html: "Stored in a signed 32-bit integer, a Unix timestamp overflows on <strong>19 January 2038</strong> at 03:14:07 UTC. Modern systems use 64-bit time values, which pushes the limit far beyond any practical horizon, but legacy embedded systems and old database columns can still be affected. If you maintain something with a 32-bit time field, that is a real deadline." },

      { type: "h2", id: "seconds-vs-ms", text: "Seconds vs milliseconds: the mistake everyone makes" },
      { type: "p", html: "Unix time is defined in seconds, but several ecosystems count in milliseconds instead. JavaScript's <code>Date.now()</code> returns milliseconds. Java's <code>System.currentTimeMillis()</code> returns milliseconds. Python's <code>time.time()</code> returns seconds (as a float). Most Unix CLI tools and PostgreSQL's <code>extract(epoch from …)</code> give you seconds." },
      { type: "p", html: "Mixing them is the single most common epoch bug, and it is instantly recognisable by the symptom:" },
      { type: "ul", items: [
        "A date in <strong>1970</strong> means you fed milliseconds into something expecting seconds — the value was divided by 1000 in effect, landing just after the epoch.",
        "A date <strong>tens of thousands of years in the future</strong> means the reverse: seconds interpreted as milliseconds.",
      ] },
      { type: "p", html: "The quick eyeball test: a current timestamp in seconds has <strong>10 digits</strong>; in milliseconds it has <strong>13</strong>. Our converter applies exactly that rule — values of 10 digits or fewer are read as seconds, longer values as milliseconds — and shows you both, so a mismatch is obvious immediately." },
      {
        type: "table",
        headers: ["Language / system", "Function", "Unit"],
        rows: [
          ["JavaScript", "Date.now()", "Milliseconds"],
          ["Python", "time.time()", "Seconds (float)"],
          ["Java", "System.currentTimeMillis()", "Milliseconds"],
          ["PHP", "time()", "Seconds"],
          ["Go", "time.Now().Unix()", "Seconds"],
          ["PostgreSQL", "extract(epoch from now())", "Seconds"],
          ["MySQL", "UNIX_TIMESTAMP()", "Seconds"],
          ["Unix shell", "date +%s", "Seconds"],
        ],
        caption: "Which unit each environment hands you. Check this before comparing two timestamps from different systems.",
      },

      { type: "h2", id: "use-cases", text: "Where developers actually meet epoch time" },
      { type: "h3", id: "debugging", text: "Debugging logs and incidents" },
      { type: "p", html: "Log lines, crash reports and metrics pipelines often store raw epoch values. During an incident you are correlating events across services, and the first job is turning three numbers into three readable UTC times so you can see the order and the gaps. Converting a couple of endpoints of a window is faster than reconfiguring a log viewer." },
      { type: "h3", id: "apis", text: "APIs, tokens and webhooks" },
      { type: "p", html: 'JWTs carry <code>iat</code>, <code>exp</code> and <code>nbf</code> claims as epoch seconds — "is this token expired?" is a conversion away. Rate-limit headers such as <code>X-RateLimit-Reset</code> are usually epoch seconds too, as are webhook signature timestamps and OAuth expiry fields. To inspect a whole token rather than one claim, our <a href="/tools/jwt-decoder" class="text-signal underline underline-offset-2">JWT Decoder</a> does the decoding for you.' },
      { type: "h3", id: "databases", text: "Databases and data files" },
      { type: "p", html: 'Plenty of schemas store integer epoch columns instead of a native timestamp type, and exported CSVs frequently arrive that way. Before you load or chart that data you need to know the unit and the boundary values. When you are reshaping the file itself, <a href="/tools/csv-json" class="text-signal underline underline-offset-2">CSV ⇄ JSON</a> and <a href="/tools/json-format" class="text-signal underline underline-offset-2">JSON Formatter</a> pair well with this tool.' },
      { type: "h3", id: "scheduling", text: "Scheduling and durations" },
      { type: "p", html: 'Cache TTLs, cron windows, retry backoffs, "expires in" banners — all are arithmetic on epoch integers. For the gap between two timestamps use <a href="/tools/epoch-diff" class="text-signal underline underline-offset-2">Epoch Diff</a>, and for making sense of a cron expression try the <a href="/tools/cron-parser" class="text-signal underline underline-offset-2">Cron Parser</a>.' },

      { type: "h2", id: "how-to", text: "How to use the EasyFileMagic Unix Timestamp Converter" },
      { type: "p", html: 'The converter is a two-way form: change either side and the other updates instantly. Everything is computed in your browser with the standard JavaScript <code>Date</code> API — nothing is sent anywhere, so you can paste production timestamps into it without a second thought.' },
      { type: "ol", items: [
        'Open the <a href="/tools/timestamp-converter" class="text-signal underline underline-offset-2">Unix Timestamp Converter</a>. The panel at the top shows the current time, ticking once a second, in both epoch seconds and ISO 8601.',
        "Paste your value into the <strong>Unix timestamp</strong> field. Seconds and milliseconds are both accepted — 10 digits or fewer are read as seconds, longer values as milliseconds.",
        "Read the <strong>ISO 8601 (UTC)</strong> field, which updates as you type. An invalid entry shows a clear error rather than a silently wrong date.",
        "Going the other way? Type or paste an ISO date into the ISO field and the epoch value is filled in for you.",
        "Check the <strong>Human readable</strong> panel below for four views of the same instant: UTC, your local time, local ISO, and the value in milliseconds.",
        'Hit <strong>Use now</strong> for a fresh current timestamp, or <strong>Copy</strong> under either field to put the value on your clipboard.',
      ] },
      { type: "h3", id: "timezones", text: "A note on time zones" },
      { type: "p", html: "The ISO output is always UTC and ends in <code>Z</code>. The Local line renders the same instant in whatever time zone your browser is set to, which is why a colleague in another country will see a different wall-clock time for an identical timestamp. That is the point of epoch time: one instant, one number, many local renderings." },
    ],
    faqs: [
      { q: "What is a Unix timestamp?", a: "It is the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970 — the Unix epoch — ignoring leap seconds. It identifies an exact instant in time as a single integer, with no time zone attached." },
      { q: "Is my timestamp in seconds or milliseconds?", a: "Count the digits. A present-day timestamp is 10 digits in seconds and 13 in milliseconds. Our converter auto-detects using that rule: 10 digits or fewer are treated as seconds, longer values as milliseconds." },
      { q: "Why does my date show as 1970?", a: "You almost certainly passed milliseconds to something expecting seconds, so the value resolved to a moment just after the Unix epoch. Divide by 1000, or paste the raw value into the converter to see which unit it really is." },
      { q: "Can I convert a date back into a Unix timestamp?", a: "Yes. The converter works in both directions — type an ISO 8601 date into the ISO field and the epoch value is calculated for you, or press 'Use now' to get the current timestamp." },
      { q: "Does a Unix timestamp have a time zone?", a: "No. It is always counted in UTC, which is what makes it unambiguous. Local time is applied only when you display it, which is why the tool shows the UTC and local renderings side by side." },
      { q: "What is the year 2038 problem?", a: "A Unix timestamp stored in a signed 32-bit integer overflows on 19 January 2038 at 03:14:07 UTC. Systems using 64-bit time values are unaffected; legacy embedded devices and old 32-bit database columns can still be." },
      { q: "Are my timestamps sent to a server?", a: "No. The conversion uses the browser's built-in Date API and runs entirely on your device — nothing is uploaded, logged or stored." },
    ],
    cta: { toolSlug: "timestamp-converter", heading: "Convert a Unix timestamp now", body: "Paste epoch seconds or milliseconds and get ISO 8601, UTC and local time instantly — with a live current-time reference. Free, no signup, runs in your browser." },
    sources: [
      { label: "The Open Group — POSIX Base Definitions: Seconds Since the Epoch", href: "https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16" },
      { label: "MDN — JavaScript Date.now()", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now" },
      { label: "RFC 3339 — Date and Time on the Internet: Timestamps", href: "https://www.rfc-editor.org/rfc/rfc3339" },
      { label: "RFC 7519 — JSON Web Token (exp, iat, nbf claims)", href: "https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4" },
    ],
  },
  {
    slug: "jpg-to-webp-converter-guide-2026",
    title: "JPG to WebP Converter: Why and How to Convert (2026 Guide)",
    description:
      "What WebP is, how much smaller it really is than JPEG, when to keep JPG or PNG instead, and how to convert images in your browser — free, no signup.",
    summary:
      "WebP is a Google-developed image format that Google measures at roughly 25–34% smaller than JPEG at equivalent quality, which speeds up page loads and helps Largest Contentful Paint. You can convert JPGs to WebP in your browser with EasyFileMagic's Image Converter — batch input, ZIP output, no upload and no account.",
    date: "2026-08-08",
    readMinutes: 8,
    tags: ["Image", "Convert", "How-to"],
    hero: {
      src: "/blog/blog-jpg-to-webp-hero.jpg",
      alt: "A large JPG file shrinking into a much smaller WebP file next to a page-load speed bar.",
    },
    body: [
      { type: "p", html: 'Images are usually the heaviest thing on a web page, and JPEG — designed in 1992 — is no longer the most efficient way to ship them. WebP is the pragmatic upgrade: broadly supported, visually indistinguishable at sensible quality settings, and meaningfully smaller. This guide covers what WebP actually gains you, the cases where JPG or PNG is still the right answer, and how to convert a folder of JPGs in your browser with our <a href="/tools/image-converter" class="text-signal underline underline-offset-2">Image Converter</a>.' },

      { type: "h2", id: "what-is-webp", text: "What WebP is" },
      { type: "p", html: "WebP is an image format developed by Google and first released in 2010. It supports lossy compression (like JPEG), lossless compression (like PNG), an alpha channel for transparency, and animation. That combination is unusual: one format covers what previously needed three." },
      { type: "p", html: "The lossy mode borrows block-prediction techniques from the VP8 video codec, which is why it can describe the same picture with fewer bytes than JPEG's older transform-only approach. Google's own comparative study reports WebP lossy files at roughly <strong>25–34% smaller than JPEG</strong> at equivalent SSIM quality, and WebP lossless at around <strong>26% smaller than PNG</strong>. Treat those as ballpark figures from the format's authors, not a guarantee — the real saving on your own images depends on the content and the quality setting, and the honest way to know is to convert a few and compare file sizes." },

      { type: "h2", id: "why-it-matters", text: "Why it matters: speed, Core Web Vitals, SEO" },
      { type: "p", html: 'Smaller images download faster, and on most pages the biggest visible element is an image. That element is what <strong>Largest Contentful Paint (LCP)</strong> measures — one of Google\'s Core Web Vitals, and a documented (if lightweight) ranking signal. Google\'s own performance guidance explicitly recommends serving images in modern formats such as WebP or AVIF as an LCP optimisation.' },
      { type: "ul", items: [
        "<strong>Faster first impression.</strong> A hero image that is a third smaller starts and finishes painting sooner, especially on mobile data.",
        "<strong>Lower bandwidth costs.</strong> On an image-heavy catalogue or gallery, the saving compounds across every page view.",
        "<strong>Better Lighthouse scores.</strong> \"Serve images in next-gen formats\" is a standard Lighthouse opportunity; converting to WebP removes it.",
        "<strong>Same visual result.</strong> At a quality setting around 90, most photographs are indistinguishable from the JPEG original at normal viewing size.",
      ] },
      { type: "p", html: 'Converting is only half the job. If your JPGs are also larger in pixel dimensions than they are ever displayed, resize them first with <a href="/tools/image-resize" class="text-signal underline underline-offset-2">Image Resize</a> — that usually saves more bytes than the format change does. For a whole folder in one pass, <a href="/tools/bulk-image-compress" class="text-signal underline underline-offset-2">Bulk Image Compress</a> is the faster route.' },

      { type: "h2", id: "when-to-use", text: "When to use WebP — and when to keep JPG or PNG" },
      { type: "h3", id: "use-webp", text: "Use WebP for" },
      { type: "ul", items: [
        "Photographs and hero images on your own website, where you control the markup.",
        "Product galleries, blog images, thumbnails — anywhere volume makes the per-file saving add up.",
        "Graphics that need transparency but are too photographic for PNG to compress well; WebP handles alpha in lossy mode, which PNG cannot.",
        "Simple animations you would otherwise ship as a bulky GIF.",
      ] },
      { type: "h3", id: "keep-jpg", text: "Keep JPG or PNG for" },
      { type: "ul", items: [
        "<strong>Files you send to other people.</strong> Email clients, older desktop software, some CMSes and plenty of print workflows still expect JPG or PNG. A colleague who cannot open your attachment is a worse outcome than a slightly larger file.",
        "<strong>Print.</strong> Print shops and design tools standardise on JPEG, TIFF and PDF; WebP is a web format and support in prepress software is patchy.",
        "<strong>Upload targets you do not control.</strong> Marketplaces, job portals, government forms and passport-photo uploads frequently accept JPG or PNG only.",
        "<strong>Very old browsers.</strong> Every current browser supports WebP — Chrome, Edge, Firefox, Opera and Safari (from Safari 14 / iOS 14, released in 2020). Internet Explorer 11 and pre-14 Safari do not. If your analytics still show a meaningful share of those, serve WebP through a <code>&lt;picture&gt;</code> element with a JPG fallback rather than replacing the JPG outright.",
        "<strong>Archival masters.</strong> Keep your original files. WebP conversion is a lossy re-encode; you want the untouched source if you ever need to re-edit.",
      ] },

      { type: "h2", id: "how-to", text: "How to convert JPG to WebP with EasyFileMagic" },
      { type: "p", html: 'Our converter runs entirely inside your browser tab. Your images are decoded, redrawn onto a canvas and re-encoded locally — nothing is uploaded to a server, so there is no queue, no account and no daily limit to hit.' },
      { type: "ol", items: [
        'Open the <a href="/tools/image-converter" class="text-signal underline underline-offset-2">Image Converter</a>. The page loads and then works offline-style — no upload step.',
        "Drop your JPGs onto the dropzone, or click to browse. You can add as many images as you like in one go; JPG, PNG and WEBP inputs are all accepted.",
        "Choose <strong>WEBP</strong> as the output format.",
        "Click convert. Each image is re-encoded in turn, with progress shown per file.",
        "A single image downloads directly as <code>name.webp</code>. Multiple images are bundled into a ZIP so you get the whole batch in one download.",
      ] },
      { type: "h3", id: "specs", text: "Actual specs, so you know what you are getting" },
      { type: "ul", items: [
        "<strong>Where it runs:</strong> in your browser, on the HTML canvas API. No upload, no server-side processing.",
        "<strong>Batch:</strong> yes — multiple files per run, delivered as a ZIP when there is more than one.",
        "<strong>Size limit:</strong> none imposed by us. The practical ceiling is your device's memory, so a desktop copes with much larger images than a phone.",
        "<strong>Signup:</strong> none. No account, no email, no watermark.",
        "<strong>Quality:</strong> lossy WebP is written at a fixed high quality setting (0.92), chosen to stay visually clean rather than to chase the smallest possible file.",
        "<strong>Metadata:</strong> because the image is redrawn onto a canvas, EXIF data such as GPS coordinates and camera details is not carried over. That is a privacy win for web publishing, but keep your originals if you rely on that metadata.",
      ] },
      { type: "p", html: 'Need to strip metadata from files you are <em>not</em> converting? Use <a href="/tools/exif-remover" class="text-signal underline underline-offset-2">EXIF Remover</a>. Coming from an iPhone library instead? <a href="/tools/heic-to-jpg" class="text-signal underline underline-offset-2">HEIC to JPG</a> gets you to a standard format first.' },

      { type: "h2", id: "after", text: "After converting: actually serving WebP" },
      { type: "p", html: "Converting the files is step one; your site has to reference them. Update the image paths in your CMS or templates, and if you still need to support very old browsers, wrap them:" },
      { type: "ul", items: [
        "Use <code>&lt;picture&gt;</code> with a WebP <code>&lt;source&gt;</code> and a JPG <code>&lt;img&gt;</code> fallback — browsers that do not understand WebP quietly take the JPG.",
        "Keep explicit <code>width</code> and <code>height</code> attributes so the smaller file does not introduce layout shift (CLS).",
        "Mark your hero image <code>fetchpriority=\"high\"</code> and leave below-the-fold images <code>loading=\"lazy\"</code>; format alone will not fix an LCP problem caused by load order.",
      ] },
    ],
    faqs: [
      { q: "Is WebP really smaller than JPEG?", a: "Generally yes. Google's comparative study of the format reports WebP lossy images at roughly 25–34% smaller than JPEG at equivalent SSIM quality, and WebP lossless at around 26% smaller than PNG. The saving on any specific image depends on its content and the quality setting, so the reliable test is to convert a few of your own files and compare the sizes." },
      { q: "Do all browsers support WebP in 2026?", a: "All current browsers do — Chrome, Edge, Firefox, Opera and Safari, which added support in Safari 14 and iOS 14 back in 2020. The exceptions are Internet Explorer 11 and Safari versions older than 14. If those matter to your audience, serve WebP inside a <picture> element with a JPG fallback." },
      { q: "Does converting JPG to WebP lose quality?", a: "Lossy WebP is a re-encode, so it is not pixel-identical to the source — and because the JPG was already lossy, you are compressing twice. In practice, at the high quality setting our converter uses, the difference is not visible at normal viewing size. Always keep your original files rather than converting over them." },
      { q: "Are my images uploaded when I use your converter?", a: "No. The Image Converter decodes and re-encodes each image inside your browser tab using the canvas API. Nothing is sent to a server, which is also why there is no file size cap, no daily limit and no signup." },
      { q: "Can I convert several JPGs to WebP at once?", a: "Yes. Add as many images as you want in one run; a single file downloads directly as .webp, and multiple files are bundled into a ZIP archive." },
    ],
    cta: { toolSlug: "image-converter", heading: "Convert your JPGs to WebP now", body: "Batch convert JPG and PNG to WebP in your browser — no upload, no account, no watermark, ZIP download for multiple files." },
    sources: [
      { label: "Google — WebP compression study (JPEG and PNG comparisons)", href: "https://developers.google.com/speed/webp/docs/webp_study" },
      { label: "Google — An image format for the Web (WebP overview)", href: "https://developers.google.com/speed/webp" },
      { label: "web.dev — Optimize Largest Contentful Paint", href: "https://web.dev/articles/optimize-lcp" },
      { label: "MDN — WebP image format and browser support", href: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types#webp_image" },
      { label: "Can I use — WebP browser support table", href: "https://caniuse.com/webp" },
    ],
  },
  {
    slug: "best-free-pdf-to-word-converter-2026",
    title: "Best Free PDF to Word Converter (2026): Tested Options Compared",
    description:
      "What actually matters in a free PDF to Word converter — formatting accuracy, privacy, size and daily limits, signup, OCR — plus an honest side-by-side comparison.",
    summary:
      "The best free PDF to Word converter for most people is the one that does not upload your file. EasyFileMagic's PDF ⇄ Word tool converts in your browser with no account, no watermark and no daily conversion cap; scanned PDFs need an OCR converter instead.",
    date: "2026-08-08",
    readMinutes: 9,
    tags: ["PDF", "Convert", "How-to"],
    hero: {
      src: "/blog/blog-best-pdf-to-word-hero.jpg",
      alt: "A PDF page on a workbench turning into an editable Word document beside a comparison checklist.",
    },
    body: [
      { type: "p", html: 'Search for a free PDF to Word converter and you get a hundred results that all look identical. They are not. The differences that matter are rarely on the landing page: where your file goes, how many conversions you get before a paywall, and whether the tool can read a scanned page at all. This guide explains the six criteria worth checking, then compares <a href="/tools/pdf-word" class="text-signal underline underline-offset-2">our own PDF ⇄ Word tool</a> against two of the best-known alternatives — factually, without the marketing.' },

      { type: "h2", id: "what-to-look-for", text: "Six things to check before you upload anything" },
      { type: "h3", id: "formatting", text: "1. Formatting accuracy" },
      { type: "p", html: "A PDF does not store paragraphs, headings or tables. It stores glyphs at coordinates. Every converter therefore <em>reconstructs</em> a document structure by guessing from position and font size, which is why results vary so much between tools and between documents. Simple, single-column, text-based PDFs convert almost perfectly anywhere. Multi-column layouts, sidebars, footnotes and complex tables are where converters diverge — and where you should always open the .docx and check before sending it on." },
      { type: "h3", id: "privacy", text: "2. Privacy: does the file leave your device?" },
      { type: "p", html: "This is the single biggest practical difference between converters, and the one nobody advertises. A server-side converter uploads your PDF to someone else's machine, converts it there, and deletes it later according to a retention policy. A browser-side converter loads the file into the tab and never sends it anywhere. For a restaurant menu it makes no difference. For a signed contract, a payslip, a medical letter or anything under NDA, it decides which tools you are even allowed to use." },
      { type: "h3", id: "limits", text: "3. File size and page limits" },
      { type: "p", html: "Server-based free tiers usually cap upload size because bandwidth and CPU cost them money. Browser-based tools have no server cap at all — the ceiling is your device's available memory, so a laptop handles far bigger files than a phone. If a converter refuses your file, the limit is the first thing to check." },
      { type: "h3", id: "daily-limits", text: "4. Daily conversion limits" },
      { type: "p", html: "Free tiers on hosted services are commonly metered: a small number of tasks per day or per hour, after which you wait or subscribe. The metering has to happen server-side, since that is where the work is done. Tools that convert locally have nothing to meter." },
      { type: "h3", id: "signup", text: "5. Signup and watermarks" },
      { type: "p", html: "Two hidden costs of \"free\": an email address, and a watermark on the output. Check both before you start — discovering a watermark after a 40-page conversion is a wasted afternoon." },
      { type: "h3", id: "ocr", text: "6. OCR for scanned PDFs" },
      { type: "p", html: 'If your PDF came out of a scanner or a phone camera, its pages are images. There is no text to extract, so an ordinary converter will hand you a .docx of empty paragraphs. You need optical character recognition, which is a genuinely different process. Test yours in two seconds: open the PDF and try to select a sentence with the cursor. If nothing highlights, you need an OCR converter such as <a href="/tools/pdf-word-ocr" class="text-signal underline underline-offset-2">PDF to Word (OCR)</a> or a standalone <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR tool</a>.' },

      { type: "h2", id: "comparison", text: "Comparison: EasyFileMagic vs Smallpdf vs iLovePDF" },
      { type: "p", html: "The EasyFileMagic column is taken from our own source code, not from a marketing page. The other two are established, well-built services with generous free tiers; the point below is not that they are worse, but that they are architecturally different — hosted conversion buys you server-grade layout reconstruction and costs you an upload. Their free-tier quotas change from time to time, so the exact current numbers are best read on their own pricing pages, linked at the end of this article." },
      {
        type: "table",
        headers: ["", "EasyFileMagic PDF ⇄ Word", "Smallpdf", "iLovePDF"],
        rows: [
          ["Where conversion happens", "In your browser — the PDF is read and the .docx is built locally, nothing is uploaded", "On the provider's servers (file is uploaded)", "On the provider's servers (file is uploaded)"],
          ["Account required", "No", "Free use available; an account unlocks higher limits", "Free use available; an account unlocks higher limits"],
          ["Watermark on output", "No", "No", "No"],
          ["File size limit", "None imposed by us — bounded only by your device's memory", "Free tier is size-capped; see their pricing page", "Free tier is size-capped; see their pricing page"],
          ["Daily conversion limit", "None — there is no server to meter", "Free tier is metered per day; see their pricing page", "Free tier is metered per day; see their pricing page"],
          ["Word → PDF as well", "Yes, .docx → PDF in the same tool", "Yes", "Yes"],
          ["OCR for scanned PDFs", "Not in this tool — use our separate OCR converter, which does use a server", "Available (paid tier for most OCR use)", "Available (paid tier for most OCR use)"],
          ["Formatting reconstruction", "Text, paragraph flow, and sub/superscript detection; complex multi-column tables need manual tidying", "Strong layout reconstruction, including many tables", "Strong layout reconstruction, including many tables"],
          ["Cost", "Free", "Free tier + paid plans", "Free tier + paid plans"],
        ],
        caption: "EasyFileMagic figures reflect the tool's actual implementation. Competitor free-tier quotas are deliberately not quoted as fixed numbers because they change — check their pricing pages for today's values.",
      },
      { type: "p", html: "Read the table as a trade-off rather than a scoreboard. If your document is a heavily formatted annual report and you do not mind uploading it, a hosted converter will usually get closer to the original layout on the first pass. If the document is confidential, or you are converting twenty files in a row and do not want to hit a daily cap, local conversion wins on both counts." },

      { type: "h2", id: "how-to", text: "How to convert PDF to Word using EasyFileMagic" },
      { type: "ol", items: [
        'Open <a href="/tools/pdf-word" class="text-signal underline underline-offset-2">PDF ⇄ Word</a>. Nothing loads from a server beyond the page itself.',
        'Leave the mode set to <em>PDF to Word</em>. (Switch it to <em>Word to PDF</em> if you are going the other way with a .docx.)',
        "Drop your PDF onto the dropzone, or click to browse. The file stays in the tab.",
        "Click Convert. Progress runs page by page as the text layer is read and the .docx is assembled.",
        "Download the .docx and open it in Word, Google Docs, LibreOffice or Pages, then check headings, tables and page breaks before you send it on.",
      ] },
      { type: "p", html: 'If the resulting document is empty or full of blank paragraphs, your PDF is a scan — send it through <a href="/tools/pdf-word-ocr" class="text-signal underline underline-offset-2">PDF to Word (OCR)</a> instead. If you only need the words and not the layout, <a href="/tools/pdf-to-text" class="text-signal underline underline-offset-2">PDF to Text</a> is faster and cleaner, and a table-heavy PDF often converts better through <a href="/tools/pdf-to-csv" class="text-signal underline underline-offset-2">PDF to CSV</a>.' },

      { type: "h2", id: "better-results", text: "Getting a cleaner .docx, whichever tool you use" },
      { type: "ul", items: [
        "<strong>Convert the original, not a printout.</strong> A PDF exported from Word converts far better than the same document printed, scanned and re-saved.",
        "<strong>Split long documents.</strong> Converting a 300-page PDF in three parts with <a href=\"/tools/split-pdf\" class=\"text-signal underline underline-offset-2\">Split PDF</a> is faster and easier to proofread than one giant pass.",
        "<strong>Unlock protected files first.</strong> An encrypted PDF cannot be read by any converter until the password is removed — use <a href=\"/tools/protect-pdf\" class=\"text-signal underline underline-offset-2\">Protect / Unlock PDF</a>.",
        "<strong>Expect to fix tables.</strong> No converter reliably rebuilds a complex table. Budget a minute per table rather than hunting for a tool that avoids the problem.",
        "<strong>Re-export, don't re-convert.</strong> Once you have the .docx, edit there and export a fresh PDF with <a href=\"/tools/text-to-pdf\" class=\"text-signal underline underline-offset-2\">Text to PDF</a> or Word itself; round-tripping repeatedly degrades the layout each time.",
      ] },
    ],
    faqs: [
      { q: "What is the best free PDF to Word converter in 2026?", a: "It depends on the document. For confidential files and unlimited conversions, a browser-based converter like EasyFileMagic's PDF ⇄ Word tool is the best choice because the file never leaves your device and there is no daily cap. For a heavily formatted report where layout fidelity matters more than privacy, a hosted service such as Smallpdf or iLovePDF will usually reconstruct complex tables more closely." },
      { q: "Is the EasyFileMagic PDF to Word converter really free, with no signup?", a: "Yes. There is no account, no email address, no watermark and no paid tier for this tool. Conversion runs in your browser, so there is no server cost to recover and nothing to meter." },
      { q: "Does my PDF get uploaded to a server?", a: "Not with the PDF ⇄ Word tool — the file is read and converted inside your browser tab. The one exception on our site is the OCR-based converter for scanned documents, which is labelled as network-based on its own page because character recognition runs server-side." },
      { q: "Why is my converted Word document empty?", a: "Almost always because the PDF is a scan with no text layer, so there is nothing to extract. Open the PDF and try selecting a sentence: if nothing highlights, run it through an OCR converter such as PDF to Word (OCR) instead." },
      { q: "Is there a file size or daily conversion limit?", a: "We impose neither. Because conversion happens locally, the practical ceiling is your device's available memory — a desktop handles much larger PDFs than a phone. Hosted free tiers, by contrast, usually cap both upload size and the number of daily tasks." },
    ],
    cta: { toolSlug: "pdf-word", heading: "Convert your PDF to Word now", body: "Free, no account, no watermark, no daily limit — and the file never leaves your browser." },
    sources: [
      { label: "Smallpdf — pricing and free-tier limits", href: "https://smallpdf.com/pricing" },
      { label: "iLovePDF — pricing and free-tier limits", href: "https://www.ilovepdf.com/pricing" },
      { label: "Adobe — PDF (ISO 32000) specification overview", href: "https://www.adobe.com/pdf/pdfs/ISO32000-1PublicPatentLicense.pdf" },
      { label: "Mozilla PDF.js — the text-extraction engine used by this tool", href: "https://mozilla.github.io/pdf.js/" },
    ],
  },
  {
    slug: "how-to-merge-pdf-files-free",
    title: "How to Merge PDF Files for Free (Without Uploading Them Anywhere)",
    description:
      "Combine two or more PDFs into a single document in your browser — page order, mixed page sizes, scanned pages, and what to do when a merge fails.",
    summary:
      "Open Merge PDF, drop your files in the order you want them, drag to reorder, and download the combined document. It runs entirely in your browser, so nothing is uploaded and there is no page or file-count limit beyond your device's memory.",
    date: "2026-08-06",
    readMinutes: 7,
    tags: ["PDF", "How-to"],
    hero: {
      src: "/blog/blog-merge-pdf-hero.jpg",
      alt: "Illustration of several PDF sheets sliding together into one bound PDF document on a workbench.",
    },
    body: [
      { type: "p", html: 'Merging PDFs is one of those jobs that should take fifteen seconds and often takes fifteen minutes. You have a signed contract, two scanned appendices and a cover letter, and the portal you are submitting to accepts exactly one file. This guide covers the fast path, plus the handful of edge cases — mixed page sizes, scanned pages, forms, bookmarks — that trip people up.' },
      { type: "h2", id: "fast-path", text: "The fast path: merge in your browser" },
      { type: "ol", items: [
        'Open <a href="/tools/merge-pdf" class="text-signal underline underline-offset-2">Merge PDF</a>.',
        "Drop in every PDF you want to combine. You can add them in several passes — nothing is uploaded, so adding files is instant.",
        "Drag the file cards into the order you want. The order in the list is the order in the finished document.",
        "Click Merge, then download. The result is a single PDF containing every page, in order.",
      ] },
      { type: "p", html: "Because processing happens inside the tab using WebAssembly, there is no upload wait and no server-side size cap. A 400-page merge of six files typically completes in a couple of seconds on a modern laptop." },
      { type: "h2", id: "page-order", text: "Getting the page order right the first time" },
      { type: "p", html: 'Most merge mistakes are ordering mistakes. Two habits fix them permanently. First, rename your files with a numeric prefix before you start — <em>01-cover.pdf</em>, <em>02-contract.pdf</em>, <em>03-appendix.pdf</em> — so the order is obvious at a glance. Second, if you need pages from the middle of a document rather than the whole thing, extract them first with <a href="/tools/split-pdf" class="text-signal underline underline-offset-2">Split PDF</a>, then merge the extracted pieces.' },
      { type: "p", html: 'If you only need to shuffle, rotate or delete pages inside one existing PDF, <a href="/tools/pdf-organize" class="text-signal underline underline-offset-2">Organize PDF</a> is the better tool — it gives you a page-thumbnail view rather than a file list.' },
      { type: "h2", id: "mixed-sizes", text: "Mixed page sizes and orientations" },
      { type: "p", html: "A PDF can contain pages of different dimensions, so merging an A4 report with a US-Letter invoice and a landscape spreadsheet produces a valid file where each page keeps its original size. On screen this is fine. In print it means the tray keeps switching and pages come out inconsistently scaled." },
      { type: "p", html: 'If the merged file is going to be printed, normalise first: run the odd-sized pages through <a href="/tools/pdf-crop" class="text-signal underline underline-offset-2">Crop PDF</a> to a common page box, or rotate landscape scans upright with <a href="/tools/rotate-pdf" class="text-signal underline underline-offset-2">Rotate PDF</a> before merging.' },
      { type: "h2", id: "scans", text: "Merging scanned pages (and keeping the file small)" },
      { type: "p", html: "Scans are images, and images are heavy. Merge five 8 MB scans and you get a 40 MB PDF that no email will accept. The order of operations matters here: merge first, then compress once at the end. Compressing each piece separately and then merging leaves more overhead than a single pass over the finished document." },
      { type: "p", html: 'Run the merged file through <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a> at the Balanced preset. Scanned bundles routinely drop by 80–90% with no visible change at reading size. If the scans need to be searchable afterwards, put them through <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR</a> as well.' },
      { type: "h2", id: "gotchas", text: "Four things merging quietly changes" },
      { type: "ul", items: [
        "<strong>Form fields.</strong> If two PDFs both contain a field named <em>signature</em>, the merged file has a name collision and one may stop working. Flatten interactive forms before merging if the data is already filled in.",
        "<strong>Bookmarks and outlines.</strong> Some merges preserve them, some drop them. If the table of contents matters, check the result before sending.",
        "<strong>Digital signatures.</strong> A cryptographic signature covers the exact bytes of the document it signed. Merging invalidates it, always. Merge first, sign the finished document last with <a href=\"/tools/sign-pdf\" class=\"text-signal underline underline-offset-2\">Sign PDF</a>.",
        "<strong>Passwords.</strong> An encrypted PDF cannot be merged until it is unlocked. Remove protection first with <a href=\"/tools/protect-pdf\" class=\"text-signal underline underline-offset-2\">Protect / Unlock PDF</a>, merge, then re-protect the result.",
      ] },
      { type: "h2", id: "large-merges", text: "When a merge fails or the tab freezes" },
      { type: "p", html: "Browser-side merging is bounded by your device's memory, not by a server quota. Very large jobs — hundreds of megabytes of high-resolution scans — can exhaust a mobile browser. Merge in batches of five or six files, then merge the batches together. Closing other heavy tabs before you start helps more than you would expect." },
    ],
    faqs: [
      { q: "Is it safe to merge confidential PDFs online?", a: "With a browser-based tool, yes — the files are read by JavaScript inside your own tab and never leave your device. There is no upload, so there is nothing on a server to leak or retain." },
      { q: "How many PDFs can I merge at once?", a: "There is no fixed limit. The practical ceiling is your device's available memory. On a laptop, dozens of documents and hundreds of pages merge without trouble; on a phone, work in smaller batches." },
      { q: "Will merging reduce the quality of my PDFs?", a: "No. Merging copies page objects as they are — it is lossless. File size grows because you now have all the pages in one document. Compress afterwards if the result is too large." },
      { q: "Can I merge a Word document into a PDF?", a: "Convert it to PDF first, then merge. Any print-to-PDF export works, and text or Markdown can go through the Text to PDF tool." },
    ],
    cta: { toolSlug: "merge-pdf", heading: "Combine your PDFs in one pass", body: "Merge PDF joins any number of documents in the order you choose — entirely in your browser, with no upload and no sign-up." },
    sources: [
      { label: "ISO 32000-1 — PDF specification (Adobe)", href: "https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf" },
      { label: "MDN — File API", href: "https://developer.mozilla.org/en-US/docs/Web/API/File_API" },
    ],
  },

  {
    slug: "convert-pdf-to-word-keep-formatting",
    title: "How to Convert a PDF to Word and Actually Keep the Formatting",
    description:
      "Why PDF-to-Word conversions come out messy, which documents convert cleanly, and a realistic workflow for getting editable text out of any PDF — including scans.",
    summary:
      "PDFs store positioned glyphs, not paragraphs, so every PDF-to-Word conversion is a reconstruction. Text-based PDFs with a simple single-column layout convert almost perfectly; scans need OCR first, and heavily designed layouts are usually faster to rebuild than to fix.",
    date: "2026-08-05",
    readMinutes: 8,
    tags: ["PDF", "Convert", "How-to"],
    hero: {
      src: "/blog/blog-pdf-to-word-hero.jpg",
      alt: "Illustration of a PDF document turning into an editable word processor document with a cursor and text lines.",
    },
    body: [
      { type: "p", html: 'Everyone has had this moment: you open a converted PDF in Word and the text is there, but the columns have collapsed, the table is a pile of tab characters, and every third line has a stray break in it. That is not a bug in the converter. It is the honest consequence of what a PDF actually is.' },
      { type: "h2", id: "why-messy", text: "Why the formatting breaks" },
      { type: "p", html: 'A Word file describes <em>intent</em>: this is a Heading 2, this is a bulleted list, this table has four columns. A PDF describes <em>appearance</em>: draw this glyph at these coordinates in this font at this size. The paragraph structure was thrown away when the PDF was made.' },
      { type: "p", html: "So a converter has to infer structure back from geometry: glyphs on the same baseline are probably a line, lines with consistent spacing are probably a paragraph, a repeating grid of short cells is probably a table. On a clean single-column report those heuristics are close to perfect. On a magazine layout with pull quotes and floating captions, they are guesses." },
      { type: "h2", id: "which-convert-well", text: "Which PDFs convert well" },
      { type: "ul", items: [
        "<strong>Converts almost perfectly:</strong> single-column reports, letters, contracts, invoices, anything exported from Word in the first place.",
        "<strong>Converts with light cleanup:</strong> two-column documents, simple tables with visible ruled lines, documents with headers and footers.",
        "<strong>Converts badly:</strong> magazine and brochure layouts, slides exported to PDF, forms with overlapping fields, anything where text is set in text boxes at odd angles.",
        "<strong>Does not convert at all without OCR:</strong> scans and photos of documents — there is no text in the file, only pixels.",
      ] },
      { type: "h2", id: "workflow", text: "The practical workflow" },
      { type: "ol", items: [
        'Check whether the PDF has real text: open it and try to select a sentence. If the selection highlights individual words, it is text-based. If you can only draw a box over the whole page, it is a scan.',
        'Text-based: run it through <a href="/tools/pdf-word" class="text-signal underline underline-offset-2">PDF to Word</a> and open the result.',
        'Scanned: use <a href="/tools/pdf-word-ocr" class="text-signal underline underline-offset-2">PDF to Word (OCR)</a> instead, which recognises the characters first. Expect to proofread numbers and proper nouns.',
        'Only need the words, not the layout? <a href="/tools/pdf-to-text" class="text-signal underline underline-offset-2">PDF to Text</a> gives you clean plain text with none of the reconstruction artefacts.',
        "In Word, turn on formatting marks (¶) before you start fixing anything. Most of the mess is stray line breaks and manual spacing that are invisible until you can see them.",
      ] },
      { type: "h2", id: "cleanup", text: "Five-minute cleanup that fixes most documents" },
      { type: "ul", items: [
        "Find and replace double spaces with single spaces, twice.",
        "Replace manual line breaks inside paragraphs (^l) with nothing, then re-space paragraphs with paragraph styles rather than empty lines.",
        "Select all and reset the font to one family — converters often embed three near-identical fonts.",
        "Rebuild tables rather than repairing them. Pasting the cell text into a fresh Word table is faster than nudging a broken one.",
        "Apply real heading styles as you go, so the document is navigable and accessible afterwards.",
      ] },
      { type: "h2", id: "tables", text: "Tables and data: use the right export" },
      { type: "p", html: 'If what you actually need is the numbers rather than the document, do not go through Word at all. <a href="/tools/pdf-to-csv" class="text-signal underline underline-offset-2">PDF to CSV</a> pulls tabular data straight out into a spreadsheet-ready file, which is far more reliable than converting to Word and copying cells by hand.' },
      { type: "h2", id: "privacy", text: "A note on privacy" },
      { type: "p", html: "Most free PDF-to-Word services upload your document to a server, convert it there, and hold it for some retention window. For a contract, a payslip or medical paperwork, that is a real disclosure. Browser-based conversion avoids the question entirely: the file is parsed in your own tab and never transmitted." },
    ],
    faqs: [
      { q: "Why does my converted Word file look nothing like the PDF?", a: "The PDF almost certainly uses a complex layout — columns, text boxes, or floating elements. Converters reconstruct structure from glyph positions, and complex layouts give ambiguous signals. Simple single-column documents convert far more faithfully." },
      { q: "Can I convert a scanned PDF to an editable Word file?", a: "Yes, but it needs OCR to recognise the characters in the image first. Use the OCR variant of the converter and proofread the result — digits, names and unusual spellings are where OCR errors cluster." },
      { q: "Is converting a PDF to Word free?", a: "Browser-based conversion here is free with no sign-up and no watermark, because the work happens on your own device rather than on a paid server." },
      { q: "Which is better: PDF to Word, or PDF to Text?", a: "If you need to edit a document that should keep looking like a document, use PDF to Word. If you just need the wording — to quote, translate or re-typeset it — PDF to Text is cleaner and has no layout artefacts." },
    ],
    cta: { toolSlug: "pdf-word", heading: "Get an editable copy of your PDF", body: "PDF to Word reconstructs your document as an editable file in the browser — no upload, no account, no watermark." },
    sources: [
      { label: "ISO 32000-1 — PDF specification (Adobe)", href: "https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf" },
      { label: "Office Open XML (ECMA-376)", href: "https://ecma-international.org/publications-and-standards/standards/ecma-376/" },
    ],
  },

  {
    slug: "compress-image-to-specific-kb-size",
    title: "How to Compress an Image to an Exact KB Size (100 KB, 200 KB, 1 MB)",
    description:
      "Government portals and job forms often demand a photo under a specific size in KB. Here is how image compression actually hits a target, and how to get there without a blurry result.",
    summary:
      "To hit a size target, reduce dimensions first, then lower JPEG quality in steps until the file fits. Resizing a 4000 px photo to 1000 px usually gets you under 200 KB on its own; quality reduction alone makes images soft long before it makes them small.",
    date: "2026-08-04",
    readMinutes: 7,
    tags: ["Image", "Compression", "How-to"],
    hero: {
      src: "/blog/blog-compress-image-kb-hero.jpg",
      alt: "Illustration of a photo being measured down to a smaller target size with a digital caliper.",
    },
    body: [
      { type: "p", html: 'Upload forms love arbitrary limits. A visa application wants your photo between 20 KB and 50 KB. A university portal caps documents at 200 KB. A job site rejects anything over 1 MB. Meanwhile your phone produces 5 MB photos by default. Here is how to land on a specific number without ending up with a smeared, unusable image.' },
      { type: "h2", id: "what-drives-size", text: "What actually drives image file size" },
      { type: "p", html: "Three factors, in order of impact:" },
      { type: "ol", items: [
        "<strong>Pixel dimensions.</strong> Halving both width and height removes three-quarters of the pixels. This is by far the biggest lever and the one people ignore.",
        "<strong>Compression quality.</strong> The JPEG quality setting, typically 0–100. Going from 95 to 80 saves a lot and is nearly invisible; going below about 60 starts showing blocky artefacts around edges and text.",
        "<strong>Format.</strong> At equal visual quality, WEBP is roughly 25–35% smaller than JPEG, and much smaller than PNG for photographs. PNG is only the right choice for flat graphics, screenshots with text, or transparency.",
      ] },
      { type: "h2", id: "recipe", text: "The recipe for hitting a target" },
      { type: "ol", items: [
        'Decide the largest size the image will ever be displayed at. A passport photo is printed at a few centimetres; a web banner is at most 2000 px wide. Anything beyond that is wasted data.',
        'Resize to that dimension with <a href="/tools/image-resize" class="text-signal underline underline-offset-2">Resize Image</a>.',
        'Open <a href="/tools/compress-image" class="text-signal underline underline-offset-2">Compress Image</a> and start at quality 80. Check the resulting size.',
        "If it is still too big, drop to 70, then 60. Below 60, go back and reduce dimensions instead — softening a large image looks worse than showing a smaller sharp one.",
        'If the destination accepts WEBP, convert with <a href="/tools/image-converter" class="text-signal underline underline-offset-2">Image Converter</a> for a free extra 30% saving.',
      ] },
      { type: "h2", id: "targets", text: "Rough starting points by target" },
      { type: "ul", items: [
        "<strong>Under 50 KB</strong> (ID photos, form portraits): 600 × 800 px, JPEG quality 70.",
        "<strong>Under 100 KB</strong> (profile pictures, thumbnails): 800–1000 px on the long edge, quality 75.",
        "<strong>Under 200 KB</strong> (scanned documents, portal uploads): 1200 px long edge, quality 75, greyscale if it is a document scan.",
        "<strong>Under 1 MB</strong> (web hero images, email attachments): 1920 px wide, quality 80, WEBP if allowed.",
      ] },
      { type: "h2", id: "documents", text: "Photos of documents are a special case" },
      { type: "p", html: "A phone photo of an ID card or a certificate is mostly flat paper. Converting it to greyscale before compressing often halves the size again with no loss of legibility, because colour channels are where much of the data lives. Crop tightly to the document itself as well — the desk around it is pure waste." },
      { type: "p", html: 'For a whole folder of images, <a href="/tools/bulk-image-compress" class="text-signal underline underline-offset-2">Bulk Image Compress</a> applies the same settings across every file at once and hands back a ZIP.' },
      { type: "h2", id: "mistakes", text: "Three mistakes that ruin the result" },
      { type: "ul", items: [
        "<strong>Recompressing an already-compressed JPEG repeatedly.</strong> Each pass bakes in the previous pass's artefacts. Always start from the original when you can.",
        "<strong>Using PNG for photographs.</strong> PNG is lossless, so a photo saved as PNG can be five times larger than the same photo as JPEG at quality 80 with no visible benefit.",
        "<strong>Upscaling to meet a minimum.</strong> Some forms demand a minimum size as well as a maximum. Enlarging a small image adds pixels but no detail; re-shoot or re-scan instead.",
      ] },
      { type: "p", html: "Everything above runs locally in the browser, which matters here more than usual — ID photos and scanned documents are exactly the files you do not want sitting in a stranger's upload folder." },
    ],
    faqs: [
      { q: "How do I compress an image to exactly 100 KB?", a: "Resize the image so its long edge is around 1000 px, then compress at JPEG quality 75 and check the size. Adjust quality in steps of 5 until you land just under the limit; if quality falls below 60, reduce the dimensions further instead." },
      { q: "Does compressing an image reduce its resolution?", a: "Not by itself. Quality compression keeps the same pixel dimensions and discards fine detail. Resizing is what changes resolution — and it is usually the more effective way to reach a size target." },
      { q: "What is the best format for small file sizes?", a: "WEBP for anything displayed on the web, JPEG for maximum compatibility with forms and portals, PNG only for graphics with flat colour, sharp text or transparency." },
      { q: "Can I compress images without uploading them?", a: "Yes. Browser-based compression uses the canvas and codec APIs already in your browser, so the image is processed on your own device and never sent anywhere." },
    ],
    cta: { toolSlug: "compress-image", heading: "Hit your size limit in two clicks", body: "Compress Image shrinks photos to the size a form will accept, right in your browser — no upload, no watermark." },
    sources: [
      { label: "MDN — Image file type and format guide", href: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types" },
      { label: "web.dev — Choose the right image format", href: "https://web.dev/articles/choose-the-right-image-format" },
    ],
  },

  {
    slug: "how-to-split-a-pdf-and-extract-pages",
    title: "How to Split a PDF or Extract Just the Pages You Need",
    description:
      "Pull single pages, ranges, or chapters out of a PDF in the browser — including how to choose between splitting, extracting and organizing, and how to keep the pieces small.",
    summary:
      "Use Split PDF to break one document into ranges or single pages. To reorder, rotate or delete pages inside a document instead, use Organize PDF. Both run locally in your browser, so the original never leaves your device.",
    date: "2026-08-04",
    readMinutes: 6,
    tags: ["PDF", "How-to"],
    hero: {
      src: "/blog/blog-split-pdf-hero.jpg",
      alt: "Illustration of a large PDF document being cut into several smaller page stacks with a craft knife.",
    },
    body: [
      { type: "p", html: 'You need page 7. The bank sent you a 60-page statement. Or the report is fine but only chapter three is going to the client. Splitting a PDF is a two-minute job that a surprising number of people still do by printing to paper and re-scanning.' },
      { type: "h2", id: "which-tool", text: "Split, extract, or organize?" },
      { type: "ul", items: [
        '<strong>Split</strong> — you want several output files: chapters, one file per invoice, a document broken every 10 pages. Use <a href="/tools/split-pdf" class="text-signal underline underline-offset-2">Split PDF</a>.',
        '<strong>Extract</strong> — you want one smaller PDF containing a subset of pages. Split with a single range does this.',
        '<strong>Organize</strong> — the pages are all staying, but in a different order or rotation, or a few need deleting. Use <a href="/tools/pdf-organize" class="text-signal underline underline-offset-2">Organize PDF</a>, which gives you draggable page thumbnails.',
        '<strong>Export as images</strong> — you need pages as pictures for a slide or a post. Use <a href="/tools/pdf-to-jpg" class="text-signal underline underline-offset-2">PDF to JPG</a>.',
      ] },
      { type: "h2", id: "steps", text: "Step by step" },
      { type: "ol", items: [
        'Open <a href="/tools/split-pdf" class="text-signal underline underline-offset-2">Split PDF</a> and drop your file in. Nothing is uploaded — the document is read locally.',
        "Choose how to split: by page ranges (for example 1-3, 8, 12-20), or into fixed-size chunks.",
        "Check the page count shown for each range before you run it. Off-by-one errors are the most common mistake, because page 1 of the printed document is often page 3 of the file once you count the cover.",
        "Split, then download. Multiple outputs come back as separate files you can save individually.",
      ] },
      { type: "h2", id: "size", text: "Why the pieces are sometimes still big" },
      { type: "p", html: "Splitting copies page objects out of the original. If a page references a shared resource — an embedded font, a logo used on every page — that resource is copied into each output file. A 20 MB document split into ten pieces can add up to more than 20 MB in total. That is normal, not a bug." },
      { type: "p", html: 'If a single extracted page is still surprisingly heavy, it almost certainly contains a high-resolution image. Run it through <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a> and it will usually collapse to a fraction of the size.' },
      { type: "h2", id: "privacy", text: "Sensitive documents: split locally, redact properly" },
      { type: "p", html: 'Statements, medical records and contracts are the documents people most often need to split, and exactly the ones you should not upload to an unknown server. Everything here runs in the browser tab.' },
      { type: "p", html: 'One important caveat: removing pages is not redaction. If you need to hide information <em>within</em> a page, drawing a black rectangle in an annotation tool leaves the text underneath selectable. Use <a href="/tools/pdf-redact" class="text-signal underline underline-offset-2">Redact PDF</a>, which removes the underlying content rather than covering it.' },
      { type: "h2", id: "after", text: "Common follow-ups" },
      { type: "ul", items: [
        'Recombining a subset into a new document: <a href="/tools/merge-pdf" class="text-signal underline underline-offset-2">Merge PDF</a>.',
        'Adding page numbers after re-ordering: <a href="/tools/page-numbers-pdf" class="text-signal underline underline-offset-2">Add Page Numbers</a>.',
        'Making the extract searchable if it came from a scan: <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR</a>.',
      ] },
    ],
    faqs: [
      { q: "How do I extract a single page from a PDF?", a: "Open Split PDF, enter that page number as a one-page range, and run the split. The output is a new PDF containing only that page, with its original quality intact." },
      { q: "Does splitting a PDF reduce quality?", a: "No. Pages are copied verbatim, so the extracted pages are pixel-for-pixel identical to the originals." },
      { q: "Why is my extracted page almost as large as the whole document?", a: "Shared resources such as embedded fonts and images get copied into each output file, and a single page with a high-resolution scan carries most of the document's weight. Compressing the extract fixes it." },
      { q: "Can I split a password-protected PDF?", a: "Not until it is unlocked. Remove the password first with the unlock tool, split the document, then re-apply protection to the pieces if you still need it." },
    ],
    cta: { toolSlug: "split-pdf", heading: "Take out just the pages you need", body: "Split PDF breaks any document into ranges or single pages in your browser — the original file never leaves your device." },
    sources: [
      { label: "ISO 32000-1 — PDF specification (Adobe)", href: "https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf" },
      { label: "NIST — Redaction of sensitive information guidance", href: "https://csrc.nist.gov/pubs/sp/800/188/final" },
    ],
  },

  {
    slug: "how-to-create-a-qr-code-that-works",
    title: "How to Create a QR Code That Actually Scans (Free, No Expiry)",
    description:
      "A practical guide to making QR codes that work in the real world — size, contrast, error correction, static versus dynamic codes, and the print mistakes that break them.",
    summary:
      "A static QR code encodes your link directly, works forever, and needs no account. Keep the URL short, print it at least 2 × 2 cm, keep a clear white margin around it, and always test-scan the final printed piece before it goes out.",
    date: "2026-08-03",
    readMinutes: 7,
    tags: ["QR", "How-to", "Design"],
    hero: {
      src: "/blog/blog-qr-code-guide-hero.jpg",
      alt: "Illustration of a printed QR code on a card being scanned by a phone on a workbench.",
    },
    body: [
      { type: "p", html: 'QR codes are easy to generate and easy to get wrong. The failure mode is brutal, too: you only find out that the code on 5,000 printed flyers does not scan after the flyers are printed. This guide covers the decisions that matter before you hit generate.' },
      { type: "h2", id: "static-dynamic", text: "Static vs dynamic: pick deliberately" },
      { type: "p", html: '<strong>Static</strong> codes encode the destination directly in the pattern. Nothing is stored anywhere, nothing can expire, and no company can switch off your code or start charging for it. The trade-off: to change the destination you must reprint.' },
      { type: "p", html: '<strong>Dynamic</strong> codes encode a short redirect URL owned by a service. You can change the destination later and see scan analytics — but the code stops working the day that service disappears or your subscription lapses. Plenty of restaurant menus went dead exactly this way.' },
      { type: "p", html: 'For a menu, a business card, a Wi-Fi password or an event ticket, static is almost always the right answer. Generate one with the <a href="/tools/qr-code-generator" class="text-signal underline underline-offset-2">QR Code Generator</a> — it runs in your browser, so the code is yours and there is nothing to expire.' },
      { type: "h2", id: "short-url", text: "Keep the payload short" },
      { type: "p", html: "The more characters you encode, the denser the grid gets, and dense grids need bigger printing and better cameras. A 30-character URL produces a comfortably chunky code. A 200-character tracking URL with five UTM parameters produces a fine mesh that struggles at small sizes and in poor light. Strip unnecessary parameters, or use a short landing URL on your own domain." },
      { type: "h2", id: "size-contrast", text: "Size, contrast and quiet zone" },
      { type: "ul", items: [
        "<strong>Size.</strong> A rough rule: the printed code should be at least one tenth of the scanning distance. Scanned from 30 cm (a flyer in hand) means 3 cm minimum is safe; 2 × 2 cm is the practical floor for anything printed.",
        "<strong>Contrast.</strong> Dark modules on a light background, with real contrast. Light-grey-on-white and dark-on-dark both fail. Inverted codes (light on dark) work on some scanners and not others — avoid them.",
        "<strong>Quiet zone.</strong> Leave a clear margin of roughly four module widths around the whole code. Text or graphics crowding the edge is one of the most common causes of scan failure.",
        "<strong>Surface.</strong> Glossy laminate and curved bottles create glare and distortion. Matte finishes and flat surfaces scan far more reliably.",
      ] },
      { type: "h2", id: "error-correction", text: "Error correction, and putting a logo in the middle" },
      { type: "p", html: "QR codes carry redundancy at four levels — roughly 7%, 15%, 25% and 30% of the code can be damaged and still read. Higher correction means a denser grid, so it is a trade, not a free upgrade." },
      { type: "p", html: "Use level M (15%) for screens and clean print. Step up to Q or H if the code will live outdoors, on packaging that gets scuffed, or if you plan to drop a logo over the centre. A logo should never cover more than about 20% of the area even at level H — and you must test-scan afterwards, from several phones." },
      { type: "h2", id: "beyond-urls", text: "QR codes that are not links" },
      { type: "p", html: 'A QR code can carry any short text, which makes some very practical non-link uses: Wi-Fi credentials that connect a guest with one scan, a vCard that saves your contact details instantly, an email or SMS draft, a calendar event. The <a href="/tools/qr-vcard-wifi" class="text-signal underline underline-offset-2">vCard &amp; Wi-Fi QR generator</a> builds those payloads in the correct format, which is fiddly to type by hand.' },
      { type: "p", html: 'To check what an existing code contains — including one you did not create — the <a href="/tools/qr-scanner" class="text-signal underline underline-offset-2">QR Scanner</a> decodes it from an image so you can read the destination before visiting it. For retail and inventory work, linear <a href="/tools/barcode-generator" class="text-signal underline underline-offset-2">barcodes</a> are still the correct format.' },
      { type: "h2", id: "test", text: "Test before you print. Every time." },
      { type: "ol", items: [
        "Scan the on-screen version with at least two different phones, one iOS and one Android.",
        "Print a single proof at final size on the actual stock, then scan that.",
        "Test in the light the code will actually live in — dim restaurant lighting, direct sun on a window sticker.",
        "Scan from the realistic distance, not with your phone touching the paper.",
      ] },
      { type: "p", html: "Four minutes of testing has saved more print runs than any design decision on this list." },
    ],
    faqs: [
      { q: "Do free QR codes expire?", a: "Static QR codes never expire — the destination is encoded in the pattern itself, so there is no service in the middle that can shut down. Only dynamic codes, which route through a provider's redirect, can stop working." },
      { q: "What size should a printed QR code be?", a: "At least 2 × 2 cm, and as a rule roughly one tenth of the intended scanning distance. Posters read from three metres away need codes around 30 cm across." },
      { q: "Can I put my logo in the middle of a QR code?", a: "Yes, if you generate the code with high error correction and keep the logo under about 20% of the code area. Always test-scan the finished artwork on several phones before printing." },
      { q: "Are QR code generators safe to use?", a: "A browser-based generator builds the code on your device, so whatever you encode — a Wi-Fi password, contact details — never reaches a server. Be more careful with services that require an account and route scans through their own domain." },
    ],
    cta: { toolSlug: "qr-code-generator", heading: "Make a QR code that never expires", body: "The QR Code Generator builds static, permanent codes in your browser — no account, no redirect service, no subscription to keep alive." },
    sources: [
      { label: "ISO/IEC 18004 — QR code specification", href: "https://www.iso.org/standard/83389.html" },
      { label: "Wi-Fi QR code payload format", href: "https://en.wikipedia.org/wiki/QR_code#Joining_a_Wi-Fi_network" },
    ],
  },

  {
    slug: "how-to-compress-a-pdf-without-losing-quality",
    title: "How to Compress a PDF Without Losing Quality (Free, No Sign-Up)",
    description:
      "A practical, no-nonsense guide to shrinking PDFs for email and upload — how compression works, when to use lossy vs lossless, and step-by-step in your browser.",
    date: "2026-07-14",
    readMinutes: 8,
    tags: ["PDF", "Compression", "How-to"],
    hero: {
      src: "/blog/blog-compress-pdf-hero.jpg",
      alt: "Illustration of a PDF document being fed through a small workshop machine that produces a slimmer PDF on a workbench pegboard.",
    },
    body: [
      {
        type: "p",
        html: 'Every workflow eventually runs into it: your PDF is 42 MB, the upload form caps at 10, and the deadline is in ten minutes. The good news is that most oversized PDFs are only oversized for one or two very fixable reasons — and you don\'t need Acrobat Pro, an installer, or an email address to fix them.',
      },
      {
        type: "p",
        html: 'This guide walks through why PDFs get big, the difference between lossless and lossy compression, and the exact steps to shrink one in your browser with the <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a> tool. It also covers what to do when a PDF <em>refuses</em> to shrink — usually a sign that the file needs a different tool entirely.',
      },

      { type: "h2", id: "why-size", text: "Why file size actually matters" },
      {
        type: "p",
        html: "PDF size isn't only about email attachment limits. Larger files upload slower on flaky connections, cost more bandwidth on mobile plans, and are markedly worse for accessibility — screen readers and low-power devices stall on massive documents. A 30 MB contract that could be 3 MB isn't just inconvenient; it's a small tax on every recipient.",
      },
      {
        type: "p",
        html: "There are also hard limits worth remembering. Gmail refuses attachments over 25 MB. Most contact forms cap uploads at 5–10 MB. Government portals often draw the line at 4 MB per document. When your PDF crosses one of those thresholds, the fix is compression — not splitting the file into pieces and hoping the reviewer stitches them back together.",
      },

      {
        type: "figure",
        src: "/blog/blog-compress-pdf-lossy.jpg",
        alt: "A bloated PDF full of loose photos on the left, compared to a slim compressed PDF on the right, with an orange arrow between them.",
        caption: "Most oversized PDFs are oversized because of the images inside them, not the text.",
      },

      { type: "h2", id: "lossy-vs-lossless", text: "Lossless vs lossy: which do you actually want?" },
      {
        type: "p",
        html: '<strong>Lossless</strong> compression rewrites how the PDF stores data without discarding anything. Streams get re-packed with better algorithms, fonts get subset, duplicate objects get merged. You keep every pixel of every image and every kerning decision. The trade-off is modest savings: 10–30% on a typical document.',
      },
      {
        type: "p",
        html: '<strong>Lossy</strong> compression targets the parts of a file the human eye barely notices. In PDFs, that\'s almost always embedded images — high-resolution scans, photographs, screenshots. Re-encoding them at 150 DPI with JPEG quality 0.7 can cut a 40 MB PDF to 4 MB without any obvious visual difference. This is the setting that does the heavy lifting.',
      },
      {
        type: "p",
        html: "Rule of thumb: use lossless for legal documents you want byte-for-byte pristine (contracts with wet signatures, filings, audit trails). Use lossy for anything you're going to email, upload, or print at normal desk-scale — decks, invoices, scanned receipts, brochures. If you're not sure, try lossy first and open the result. If it looks fine, ship it.",
      },

      { type: "h2", id: "step-by-step", text: "Step-by-step: shrink a PDF in your browser" },
      {
        type: "p",
        html: 'Everything below runs client-side. Your PDF is never uploaded to a server — the compression happens inside the browser tab, using JavaScript and WebAssembly. Close the tab and the file is gone from our end (because it was never on our end).',
      },
      {
        type: "ol",
        items: [
          'Open <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a>.',
          "Drop your PDF onto the dashed box, or click to browse.",
          "Pick a preset — Balanced is the right default; try Tiny if you're up against a strict size cap and can accept slightly softer images.",
          'Click <em>Compress PDF</em>. The progress bar shows what the tool is doing; images being re-encoded takes the longest.',
          "When it's ready, the download panel appears with a big orange <em>Download</em> button. The compressed file downloads once automatically and stays available if you need it again.",
        ],
      },
      {
        type: "p",
        html: 'A well-scanned 20-page contract typically drops from 12–15 MB to under 2 MB at Balanced. A photo-heavy portfolio can go from 80 MB to 6 MB at Tiny. Text-only invoices are already tiny (200–400 KB) and won\'t change much — that\'s expected.',
      },

      { type: "h2", id: "scanned-docs", text: "Scanned documents and photos-in-PDFs" },
      {
        type: "p",
        html: 'Scanners are the single biggest culprit behind bloated PDFs. A "quick scan" of a five-page contract on default settings often produces a 40 MB file, because every page is stored as a full-resolution color photograph — even if the content is black text on white paper.',
      },
      {
        type: "p",
        html: 'You have two good options:',
      },
      {
        type: "ul",
        items: [
          "Compress the PDF at Tiny preset. This down-samples the embedded scans to 100–120 DPI and re-encodes them as JPEG. Text is still perfectly readable on screen and prints fine on a laser printer.",
          'If you actually need the text to be searchable and selectable — not just look right — run the file through <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR</a> first to extract the words, then rebuild a lightweight text-based PDF. This is the right approach for anything you\'ll need to search later.',
        ],
      },
      {
        type: "p",
        html: 'For PDFs that are really just "a folder of photos wrapped in a PDF shell," it\'s often faster to <a href="/tools/pdf-to-jpg" class="text-signal underline underline-offset-2">extract the images</a>, <a href="/tools/compress-image" class="text-signal underline underline-offset-2">compress each one</a>, and rebuild the document with <a href="/tools/image-to-pdf" class="text-signal underline underline-offset-2">Image to PDF</a>. You get pixel-level control and usually beat any generic PDF compressor by a wide margin.',
      },

      { type: "h2", id: "troubleshooting", text: "Troubleshooting: my PDF still won't shrink" },
      {
        type: "p",
        html: "Occasionally you'll compress a file and it barely changes size, or even gets slightly larger. That's almost always one of the following:",
      },
      {
        type: "h3", id: "already-compressed", text: "It's already compressed",
      },
      {
        type: "p",
        html: "PDFs from professional design tools (InDesign, Illustrator) are usually already down-sampled and optimized. There's no fat left to trim. A 1.4 MB technical datasheet is at its natural size — don't spend an afternoon trying to get it to 800 KB.",
      },
      {
        type: "h3", id: "encrypted", text: "The PDF is encrypted",
      },
      {
        type: "p",
        html: 'A password-protected PDF can\'t be recompressed without first being decrypted, because the compressor can\'t read what\'s inside. Run it through <a href="/tools/protect-pdf" class="text-signal underline underline-offset-2">Protect / Unlock PDF</a> in unlock mode first (you need the password), then compress the result. Add the password back afterwards if you want it protected in transit.',
      },
      {
        type: "h3", id: "fonts", text: "The problem is fonts, not images",
      },
      {
        type: "p",
        html: 'A design deck exported with 40 unsubsetted OpenType fonts can be surprisingly large even without heavy imagery. Standard PDF compressors don\'t always subset aggressively. If you own the source file, re-exporting from the design tool with "Subset embedded fonts" ticked can save several megabytes on its own.',
      },

      { type: "h2", id: "privacy", text: "A note on privacy" },
      {
        type: "p",
        html: 'Every tool linked here — Compress PDF, OCR, PDF to JPG, Image to PDF, Protect/Unlock PDF — runs entirely inside your browser. No uploads. No accounts. No queue. That matters if you\'re working with contracts, medical records, tax returns, HR documents, or anything else you\'d rather not hand to a random SaaS. The <a href="https://developer.mozilla.org/en-US/docs/WebAssembly" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">WebAssembly</a> and File API primitives that make this possible are widely supported in every modern browser.',
      },
    ],
    cta: {
      toolSlug: "compress-pdf",
      heading: "Ready to shrink that PDF?",
      body: "Drop your file into Compress PDF and pick a preset. It runs in your browser — nothing is uploaded.",
    },
    sources: [
      { label: "MDN — WebAssembly", href: "https://developer.mozilla.org/en-US/docs/WebAssembly" },
      { label: "Adobe — About PDF compression", href: "https://helpx.adobe.com/acrobat/using/optimizing-pdfs-acrobat-pro.html" },
    ],
  },

  {
    slug: "free-file-conversion-tools-you-actually-need-2026",
    title: "10 Free File Conversion Tools You Actually Need in 2026 (No Account Required)",
    description:
      "A curated roundup of ten free, browser-based file conversion tools that cover 95% of everyday jobs — PDF to Word, image formats, audio/video, OCR, CSV/JSON — and how to pick the right one.",
    date: "2026-07-16",
    readMinutes: 10,
    tags: ["Roundup", "Conversion", "Privacy"],
    hero: {
      src: "/blog/blog-conversion-tools-hero.jpg",
      alt: "A workshop pegboard covered in file-format icons — PDF, Word, JPG, PNG, MP3, MP4, JSON, CSV and a QR code — laid out like a catalogue.",
    },
    body: [
      {
        type: "p",
        html: "There's a very specific frustration to needing a file in a different format. You have a JPG the client wants as a PNG. A voice memo in M4A that the transcription service only accepts as MP3. A PDF quote you need to edit as Word. A CSV export from one tool that the next tool only reads as JSON. Individually, none of these are hard. Collectively, they eat afternoons.",
      },
      {
        type: "p",
        html: "The good news: in 2026 you can do essentially all of it in your browser, for free, without an account. This roundup covers the ten conversions that come up most often, links straight to a working tool for each, and explains how to pick the right approach when there's more than one way.",
      },

      { type: "h2", id: "why-browser-based", text: "Why browser-based tools beat installers and SaaS" },
      {
        type: "p",
        html: 'Three reasons matter, in this order:',
      },
      {
        type: "ul",
        items: [
          "<strong>Privacy.</strong> A client-side tool processes your file inside the browser tab. It never touches a server, which means it can't leak, be indexed, or get subpoenaed. For contracts, health records, financials or anything with someone else's name on it, that's the setting that actually matters.",
          "<strong>Speed.</strong> No round-trip to a server means no queue, no rate limit, and no waiting for a worker to spin up. A 2 MB image converts in a fraction of a second — the network was always the slow part.",
          "<strong>No lock-in.</strong> No account, no trial expiration, no email captured for a re-marketing sequence. You do the thing, you close the tab, you move on.",
        ],
      },
      {
        type: "p",
        html: 'Modern browsers ship with an astonishing amount of horsepower — <a href="https://developer.mozilla.org/en-US/docs/WebAssembly" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">WebAssembly</a>, the Canvas API, the File System Access API. Tools like Tesseract.js, pdf-lib and ffmpeg.wasm are essentially the same engines that used to require a native install, now running inside the tab.',
      },
      {
        type: "figure",
        src: "/blog/blog-conversion-privacy.jpg",
        alt: "Illustration of a browser window with a padlock shield keeping JPG and MP3 files safely inside, and a broken chain preventing them from leaving to a cloud icon.",
        caption: "Client-side conversion keeps files on your device. The cloud icon on the right never sees them.",
      },

      { type: "h2", id: "the-list", text: "The ten conversions worth bookmarking" },

      { type: "h3", id: "pdf-word", text: "1. PDF ↔ Word" },
      {
        type: "p",
        html: 'The single most-requested conversion on Earth. You get a PDF quote and need to edit the terms; someone sends a Word draft and you need to circulate a locked-down PDF. <a href="/tools/pdf-word" class="text-signal underline underline-offset-2">PDF ↔ Word</a> handles both directions in-browser. Text and paragraph structure are preserved; heavily-designed layouts may reflow, which is expected for any PDF-to-Word conversion.',
      },

      { type: "h3", id: "image-formats", text: "2. Image format conversion (JPG ↔ PNG ↔ WEBP)" },
      {
        type: "p",
        html: 'Different tools want different formats. WordPress prefers WEBP for performance, some legacy printers want TIFF-style PNG, most email clients still handle JPG best. <a href="/tools/image-converter" class="text-signal underline underline-offset-2">Image Converter</a> switches between JPG, PNG and WEBP with quality controls — batch a whole folder at once and it delivers a ZIP.',
      },

      { type: "h3", id: "pdf-jpg", text: "3. PDF pages to JPG images" },
      {
        type: "p",
        html: 'When someone needs to embed a specific page of a PDF into a slide deck or a CMS. <a href="/tools/pdf-to-jpg" class="text-signal underline underline-offset-2">PDF to JPG</a> renders every page as a high-resolution JPG. One page downloads directly; multiple pages come in a ZIP.',
      },

      { type: "h3", id: "image-pdf", text: "4. Images bundled into a single PDF" },
      {
        type: "p",
        html: 'The reverse — you\'ve scanned three receipts to your phone gallery and the finance team needs "one PDF, please." <a href="/tools/image-to-pdf" class="text-signal underline underline-offset-2">Image to PDF</a> stitches JPG, PNG and WEBP into one document, in the order you drop them.',
      },

      { type: "h3", id: "compression", text: "5. PDF and image compression" },
      {
        type: "p",
        html: 'Not strictly a format conversion, but the second half of most conversion jobs. A 40 MB PDF becomes emailable via <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a>; a 12 MP camera photo becomes web-friendly via <a href="/tools/compress-image" class="text-signal underline underline-offset-2">Compress Image</a>. Both have lossy presets that are almost always the right choice for anything you\'re going to upload or email.',
      },

      { type: "h3", id: "audio-video", text: "6. Audio and video conversion" },
      {
        type: "p",
        html: 'Voice memos in M4A that need to be MP3. Screen recordings in MOV that need to be MP4. Podcast masters in WAV that need to be MP3. <a href="/tools/media-convert" class="text-signal underline underline-offset-2">Audio / Video Converter</a> runs <a href="https://ffmpeg.org/" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">ffmpeg</a> compiled to WebAssembly directly in your browser. The library is ~30 MB on first load, then cached; big files take real time (that\'s ffmpeg, not us).',
      },

      { type: "h3", id: "ocr", text: "7. Image or PDF → editable text (OCR)" },
      {
        type: "p",
        html: 'Photos of a whiteboard, a scanned invoice, a screenshot of a spec — anything where the text is trapped inside pixels. <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR</a> runs Tesseract in your browser, pulls the text out, and lets you copy it or download a .txt file. Multi-page PDFs are rasterized page by page.',
      },

      { type: "h3", id: "csv-json", text: "8. CSV ↔ JSON" },
      {
        type: "p",
        html: 'Every analyst has been here. Marketing exports a CSV; the API you need to hit takes JSON. Or the reverse — an API dump you\'d like to open in a spreadsheet. <a href="/tools/csv-json" class="text-signal underline underline-offset-2">CSV ↔ JSON</a> handles both directions with a click and works on files well into the tens of MB.',
      },

      { type: "h3", id: "background", text: "9. JPG/PNG → transparent PNG (remove background)" },
      {
        type: "p",
        html: 'A conversion that used to require Photoshop and a steady hand with the pen tool. <a href="/tools/remove-background" class="text-signal underline underline-offset-2">Remove Background</a> runs an ONNX segmentation model in your browser and returns a clean transparent PNG. First run downloads the model (~40 MB); after that it\'s instant.',
      },

      { type: "h3", id: "qr", text: "10. Text or URL → QR code" },
      {
        type: "p",
        html: 'A stealth favourite. Menus, event check-ins, quick wifi sharing at a coworking desk. <a href="/tools/qr-code-generator" class="text-signal underline underline-offset-2">QR Code Generator</a> turns any string into a downloadable PNG with adjustable error-correction. Pin it to a poster; toss it in a slide.',
      },

      { type: "h2", id: "how-to-choose", text: "How to pick the right tool for each job" },
      {
        type: "p",
        html: 'A quick mental checklist that saves time:',
      },
      {
        type: "ol",
        items: [
          "<strong>What's the source and what's the target?</strong> Write it down as source→target (JPG→PNG, PDF→DOCX, MP4→MP3). Most of the confusion is picking the wrong conversion in the first place.",
          "<strong>Is the content the pixels or the meaning?</strong> A scanned contract's pixels are the wrong thing to preserve — you want the words. Use OCR before conversion. A product photo's pixels are the whole point — use image conversion, not OCR.",
          "<strong>What size is the source file?</strong> Under 20 MB is comfortable for every browser-based tool. 100+ MB (long videos, huge design PDFs) will take a while and may need to be done in chunks.",
          "<strong>Is it sensitive?</strong> If yes, insist on client-side. All the tools listed above run locally — nothing is uploaded.",
        ],
      },

      { type: "h2", id: "closing", text: "The bigger picture" },
      {
        type: "p",
        html: "The interesting shift in 2026 isn't that these tools exist — most have for a decade. It's that the browser can now run them without a server round-trip. That flips the trust model. A file conversion tool no longer requires you to trust the operator with your file; it just requires you to trust the browser you were already using.",
      },
      {
        type: "p",
        html: 'That\'s why every tool in this roundup — and every other tool on <a href="/" class="text-signal underline underline-offset-2">EasyFileMagic</a> — is free, sign-up-free, and works offline after first load. The engine is in the tab. Bookmark the ones you use, and you\'ll never install another one-off file converter again.',
      },
    ],
    cta: {
      toolSlug: "pdf-word",
      heading: "Start with the most-used conversion",
      body: "PDF ↔ Word is the single most-requested job. Try it now — no signup, no watermark, runs in your browser.",
    },
    sources: [
      { label: "MDN — File API", href: "https://developer.mozilla.org/en-US/docs/Web/API/File_API" },
      { label: "ffmpeg.org — About FFmpeg", href: "https://ffmpeg.org/about.html" },
    ],
  },

  {
    slug: "how-to-remove-background-from-photo-without-photoshop",
    title: "How to Remove the Background From a Photo Without Photoshop",
    description: "A practical guide to erasing photo backgrounds in your browser — where the free AI tools shine, where they still struggle (hair, glass, motion blur), and small tricks that noticeably improve results.",
    summary: "Open the Remove Background tool, drop in a JPG or PNG, and you get a transparent PNG back in about 3–8 seconds. It works out of the box for portraits and product photos; hair, glass, and busy backgrounds still need a manual pass.",
    date: "2026-07-19",
    readMinutes: 7,
    tags: ["Images", "How-to", "Background"],
    hero: { src: "/blog/blog-remove-bg-hero.jpg", alt: "Illustration of a portrait photo with its background being peeled off like a sticker, revealing transparent checkerboard behind it, pinned to a workshop pegboard." },
    body: [
      { type: "p", html: "For years, cutting a person out of a photo was a rite of passage in Photoshop. You picked up the pen tool, zoomed to 400%, cursed at flyaway hairs, and eventually produced something usable. In 2026 you paste a photo into a browser tab and it's done before you finish typing this sentence. The catch is that the tools are extremely good on <em>most</em> photos and still a bit clumsy on a specific handful. Knowing the difference saves an afternoon." },
      { type: "p", html: 'Here I&apos;ll walk through what happens under the hood, when the free <a href="/tools/remove-background" class="text-signal underline underline-offset-2">Remove Background</a> tool nails it, when it doesn&apos;t, and the small changes to your source image that push accuracy from "pretty good" to "shippable."' },
      { type: "h2", id: "how", text: "How browser-based background removal actually works" },
      { type: "p", html: 'Modern remover tools run an image-segmentation model — usually something in the family of U²-Net or BiRefNet — compiled to <a href="https://onnxruntime.ai/docs/tutorials/web/" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">ONNX Runtime Web</a> and executed inside your tab. The first time you use it, the model file downloads (roughly 40 MB) and caches. From that point on, every subsequent image is processed locally, in maybe 3 to 8 seconds on a mid-range laptop.' },
      { type: "p", html: "The model doesn't &quot;see&quot; the way you do. It outputs a probability for every pixel — how confident it is that a given pixel is foreground. Values near 1 become opaque, values near 0 become transparent, and the messy middle (0.4 to 0.6) is where all the interesting mistakes happen. That middle band is almost always: hair, fur, semi-transparent glass, motion blur, and the tricky edge where a body meets a similar-colored wall." },
      { type: "h2", id: "works-well", text: "Where the free tools shine" },
      { type: "p", html: "In roughly this order:" },
      { type: "ul", items: [
        "<strong>Product photography on a clean background.</strong> A shoe on white seamless, a bottle on a gradient — the tool nails these more or less every time. This is the easiest case and probably 60% of e-commerce use.",
        "<strong>Studio-lit portraits.</strong> A person facing the camera with even lighting and a plain wall behind them. Edges are clean, the model has strong priors for &quot;human head-and-shoulders,&quot; and the result usually needs zero touch-up.",
        "<strong>Objects with hard edges.</strong> Furniture, tools, packaging, printed materials. Nothing translucent, nothing fuzzy. Ship it.",
      ] },
      { type: "figure", src: "/blog/blog-remove-bg-hero.jpg", alt: "The same portrait photo shown twice — original with its original background, and cutout showing the transparent checkerboard behind the subject.", caption: "Portraits with even lighting and a plain backdrop are the easy case." },
      { type: "h2", id: "struggles", text: "Where it still struggles" },
      { type: "p", html: "The failure modes are consistent. If you know them going in, you can either fix the source or plan for a manual touch-up." },
      { type: "h3", id: "hair", text: "Flyaway hair" },
      { type: "p", html: "Fine hair against a busy or similarly-toned background is the classic hard case. The model tends to eat a few pixels along the edge — you get a slightly harder haircut than the subject actually has. Two fixes: shoot against a background with strong tonal contrast (a redhead pops against navy; a blonde pops against dark walnut), and accept that a fine feather or 1px blur along the edge in post looks more natural than a razor-sharp cut anyway." },
      { type: "h3", id: "glass", text: "Glass, water, and other translucent stuff" },
      { type: "p", html: "A drinking glass isn't really foreground <em>or</em> background — you want to keep the object but preserve some of what's behind it. Segmentation models don't handle this well because it's not what they were trained to do. For wine glasses, spectacles, jewellery boxes with clear panels, you'll usually end up manually painting semi-transparency in with a real editor." },
      { type: "h3", id: "edges", text: "Similar-tone edges" },
      { type: "p", html: "A person in a beige coat photographed against a beige wall. A black cat on a black couch. The model has nothing to hook onto and the cutout ends up wobbling. This is 100% a source-photo problem — the shot doesn't have the information the model needs. Either recompose or use a different photo." },
      { type: "h3", id: "motion", text: "Motion blur and shallow depth of field" },
      { type: "p", html: "A hand caught mid-wave or a subject shot at f/1.4 has soft, gradually-transparent edges. The model has to pick a hard threshold somewhere, which never quite looks right. Sharper source photos always segment better." },
      { type: "h2", id: "tips", text: "Small tricks that raise the hit rate" },
      { type: "ol", items: [
        "<strong>Shoot larger than you need.</strong> The model does better on 2000+ px source images because the edge pixels have more information. Downsize the result afterwards; that&apos;s free quality.",
        "<strong>Contrast the background.</strong> Even a slight tonal difference between subject and background helps a lot. If you can control the shoot, pick a backdrop that doesn&apos;t share tones with the subject&apos;s hair, skin, or clothes.",
        "<strong>Even lighting beats dramatic lighting.</strong> Deep shadows confuse edge detection. Flat lighting isn&apos;t exciting but it cuts out cleanly.",
        "<strong>Crop first, remove second.</strong> Tighter framing means fewer pixels for the model to worry about, which is usually faster and slightly more accurate.",
        "<strong>Run it twice if unsure.</strong> Occasionally the second pass on a downloaded cutout cleans up leftover halo. Free, so no reason not to try.",
      ] },
      { type: "h2", id: "workflow", text: "A realistic workflow for e-commerce and thumbnails" },
      { type: "p", html: 'Drop the source photo into <a href="/tools/remove-background" class="text-signal underline underline-offset-2">Remove Background</a>. Download the transparent PNG. Open it in <a href="/tools/image-converter" class="text-signal underline underline-offset-2">Image Converter</a> if you need a specific format for your CMS (WEBP for web, PNG-24 for print). If the file is bigger than you&apos;d like — transparent PNGs can be chunky — pass it through <a href="/tools/compress-image" class="text-signal underline underline-offset-2">Compress Image</a> at 85% quality. Total time: under a minute, no accounts, no watermarks, no queue.' },
      { type: "p", html: 'For anyone doing this at volume, note that the model runs entirely on your device after the first download. That means it also works offline once cached — useful if you&apos;re processing sensitive product shots on a plane, or you just don&apos;t love uploading assets to random SaaS.' },
      { type: "h2", id: "when-photoshop", text: "When you actually still need Photoshop" },
      { type: "p", html: "There are three cases where a real editor still wins: precise manual masking on translucent objects, compositing where the subject needs to be color-graded to match a new background, and jobs where a client insists on layered PSDs for their pipeline. For everything else — social posts, marketplace listings, presentation slides, quick mockups — the browser is faster and the output is honestly indistinguishable to anyone who isn't zooming to 400%." },
    ],
    faqs: [
      { q: "Is browser-based background removal really as good as Photoshop?", a: "For clean subjects on plain backgrounds, yes — the edge quality is comparable and the workflow is a lot faster. Photoshop is still better for translucent objects and complex composites where you want per-pixel control." },
      { q: "Does removing the background reduce image quality?", a: "The subject pixels are preserved exactly; only the background is discarded. If you export as PNG or WEBP, there is no quality loss on the foreground. Avoid re-saving the transparent result as JPG — JPG doesn't support transparency." },
      { q: "Are my photos uploaded to a server?", a: "No. The Remove Background tool runs an AI model directly inside your browser tab. The photo never leaves your device, which matters for personal photos, unreleased product shots, or anything under NDA." },
      { q: "Why does the first image take longer than the rest?", a: "The AI model (about 40 MB) downloads and initializes on your first use, then caches. Subsequent images use the cached model and typically process in a few seconds." },
    ],
    cta: { toolSlug: "remove-background", heading: "Cut out a photo in about ten seconds", body: "Drop a JPG or PNG into Remove Background. It runs locally in your browser and gives you a transparent PNG back — no signup, no watermark." },
    sources: [
      { label: "ONNX Runtime Web — Documentation", href: "https://onnxruntime.ai/docs/tutorials/web/" },
      { label: "MDN — Using images (Canvas API)", href: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images" },
    ],
  },

  {
    slug: "pdf-wont-open-or-looks-corrupted-fix",
    title: "PDF Won't Open or Looks Corrupted? Here's How to Fix It",
    description: "Common reasons a PDF fails to open — truncated downloads, password protection, unusual encodings, damaged internal structure — and the exact repair steps that fix each one.",
    summary: "Most PDFs that won't open are either truncated (re-download), encrypted (unlock with the password), or use a format your reader can't handle (re-save through a browser or a PDF utility). Genuinely corrupted PDFs are rarer than they seem.",
    date: "2026-07-20",
    readMinutes: 8,
    tags: ["PDF", "Troubleshooting"],
    hero: { src: "/blog/blog-pdf-corrupted-hero.jpg", alt: "Illustration of a torn PDF document on a workbench with a wrench, tape, and magnifying glass laid out around it, ready for repair." },
    body: [
      { type: "p", html: 'You double-click a PDF and get "There was an error opening this document." Or the file opens but every page is blank, or half the text is gibberish squares, or the reader spins forever. Frustrating, but almost never fatal — the PDF is usually recoverable, and often the fix takes under a minute once you know which of the five common problems you&apos;re actually looking at.' },
      { type: "p", html: "This guide is organized in order of frequency: check the first thing first, then the second, and so on. By the time you get to the bottom you've either fixed it or you're looking at one of the rare cases where the file is genuinely gone." },
      { type: "h2", id: "truncated", text: "1. The file finished downloading, but not really" },
      { type: "p", html: "This is by far the most common cause and the easiest to miss. The download completed as far as your browser is concerned, but a hiccup on the server side sent you a partial file. Some PDF readers refuse partial files outright; others open them and just show blank pages after the truncation point." },
      { type: "p", html: "Check the file size against whatever the sender told you it should be. A 12 MB report that lands at 4 MB is truncated. If you can, re-download it — over a different network if you're on flaky wifi. Cloud storage links (Drive, Dropbox, WeTransfer) sometimes serve a corrupted preview file; downloading the raw file explicitly (right-click → Download) usually fixes it." },
      { type: "h2", id: "password", text: "2. The PDF is password-protected" },
      { type: "p", html: 'A reader that supports password prompts (Acrobat, Preview, Chrome&apos;s built-in) will ask for the password. Lightweight readers and some browser preview widgets just fail silently and show "cannot open." If you have any reason to think the file is protected — it came from a bank, a lawyer, an HR portal, a government form — try opening it in a different reader that will actually surface the prompt.' },
      { type: "p", html: 'Once you have the password, you can remove protection so it opens cleanly everywhere by running the file through <a href="/tools/protect-pdf" class="text-signal underline underline-offset-2">Protect / Unlock PDF</a> in unlock mode. The unlocked copy opens in every reader on Earth.' },
      { type: "h2", id: "reader-mismatch", text: "3. Your reader can't handle the PDF's features" },
      { type: "p", html: "PDF is a big, sprawling standard. Not every reader supports every feature. Common examples: PDFs with embedded 3D models (common in CAD exports), interactive forms built with newer XFA syntax, or PDFs generated with unusual color profiles that older readers can't render." },
      { type: "p", html: "Symptoms include: pages open but appear blank, text renders as random squares (a font-embedding issue), or the reader complains about an unsupported version. The fix is almost always the same — open the PDF in a modern browser (Chrome, Edge, Firefox) which uses its own permissive rendering engine, then print-to-PDF to produce a clean, universally-compatible copy. It's a five-second operation and the resulting file works everywhere." },
      { type: "figure", src: "/blog/blog-pdf-corrupted-hero.jpg", alt: "Diagram of a broken PDF being examined and repaired on a workbench.", caption: "Most PDFs that seem broken just need to be re-saved through a fresh renderer." },
      { type: "h2", id: "encoding", text: "4. Weird text encoding or missing fonts" },
      { type: "p", html: "You open the file and the text is there, but instead of letters you see rectangles or random glyphs. The PDF was generated with fonts that were referenced but not embedded, and your reader doesn't have those fonts installed. Older Word-to-PDF workflows on Windows are notorious for this." },
      { type: "p", html: 'The fix: ask the sender to re-export with "embed all fonts" enabled. If that&apos;s not possible, running the file through <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR</a> extracts the text as plain characters — you lose formatting but you can at least read and copy the content. Then rebuild a proper PDF from the extracted text via <a href="/tools/text-to-pdf" class="text-signal underline underline-offset-2">Text / Markdown to PDF</a>.' },
      { type: "h2", id: "actually-corrupted", text: "5. The PDF is actually damaged" },
      { type: "p", html: "This is the rare case, and it usually happens for a specific reason: the file was cut off during upload to a broken form, a crashed application saved a half-written PDF, or someone opened and saved it in a program that mangled the internal object table." },
      { type: "p", html: "Signs it's real corruption: the file is roughly the right size, no password prompt appears, multiple readers all fail. In that case:" },
      { type: "ol", items: [
        "Try opening it in a browser. Chrome and Firefox both have permissive rendering engines that tolerate a lot of broken PDFs and will happily render what they can.",
        'If the browser opens it, use its "Print → Save as PDF" to produce a fresh, clean copy. This regenerates the file structure from scratch and drops whatever was broken.',
        'If the browser also fails, try opening it in an image viewer that supports PDF (Preview on macOS, or a PDF-aware viewer on Windows). Sometimes one specific page is broken and the rest render fine, in which case you can <a href="/tools/pdf-to-jpg" class="text-signal underline underline-offset-2">export the working pages as images</a> and rebuild a partial PDF.',
        "If nothing works, ask the sender to regenerate the file from the source (Word, InDesign, whatever it was exported from). Truly-corrupt PDFs generally aren't repairable — the internal structure is a graph of objects, and once the offsets are wrong there's no way to reconstruct them without the original.",
      ] },
      { type: "h2", id: "prevention", text: "How to stop this happening to files you send" },
      { type: "p", html: "Two habits eliminate most of these problems on your end. First, always embed fonts on export — every modern PDF export has this option and it costs almost nothing in file size. Second, if a file is large, compress it before sending: a smaller file completes downloads reliably, and shorter transfers reduce the chance of network truncation." },
      { type: "p", html: 'Both are one-tool jobs. <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a> handles the size problem locally in your browser, and re-exporting with fonts embedded is a checkbox in every serious authoring tool.' },
    ],
    faqs: [
      { q: "Can a corrupted PDF be repaired?", a: "Sometimes. A browser like Chrome or Firefox will often render a PDF that dedicated readers reject, and you can print-to-PDF to produce a clean copy. If the internal object table is genuinely damaged, the file usually needs to be regenerated from the source." },
      { q: "Why does my PDF open in Chrome but not Adobe Reader?", a: "Chrome's renderer is more permissive and ignores some spec violations that Adobe enforces. If Chrome can open the file, you can print-to-PDF from Chrome to create a cleaner copy that Adobe accepts." },
      { q: "Is it safe to open a PDF that won't open normally?", a: "Opening a PDF in a modern browser is safe — the renderer is sandboxed. Avoid using untrusted third-party \"PDF repair\" websites that ask you to upload the file. If the PDF came from an unknown source, treat it with normal caution regardless." },
      { q: "How do I know if a PDF is password-protected or corrupted?", a: "Try opening it in Chrome or Adobe Reader. If it's protected, you'll get a password prompt. If it's corrupted, you'll get an error about the file structure or a blank/partial render." },
    ],
    cta: { toolSlug: "protect-pdf", heading: "Locked out of a PDF you own?", body: "Protect / Unlock PDF removes password protection from any PDF you know the password for — everything happens in your browser." },
    sources: [
      { label: "ISO 32000-1 — PDF standard (Adobe)", href: "https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf" },
      { label: "MDN — Using PDF.js", href: "https://developer.mozilla.org/en-US/docs/Web/API/File_API" },
    ],
  },

  {
    slug: "jpg-vs-png-vs-webp-when-to-use-each",
    title: "The Real Difference Between JPG, PNG, and WEBP (And When to Use Each)",
    description: "A no-nonsense guide to picking the right image format — how each one compresses, what they can and can't do, and specific rules of thumb for photos, screenshots, logos, and web use.",
    summary: "Use JPG for photos, PNG when you need transparency or crisp text, WEBP for anything on a modern website. WEBP is smaller than both JPG and PNG at equivalent quality; the only real reason not to use it is when the destination doesn't support it.",
    date: "2026-07-21",
    readMinutes: 8,
    tags: ["Images", "Formats", "Web"],
    hero: { src: "/blog/blog-jpg-png-webp-hero.jpg", alt: "Three image cards on a pegboard labeled JPG, PNG, and WEBP, each showing the same landscape photo rendered slightly differently." },
    body: [
      { type: "p", html: "If you spend any time working with images, you eventually hit the moment where you have to pick a format and you're not 100% sure why. JPG is smaller but PNG looks sharper? PNG has transparency but WEBP is even smaller and also has transparency? Someone said &quot;never use JPG for logos&quot; but you can't remember why?" },
      { type: "p", html: "Here's the short version, followed by the actual reasoning so you can make good calls in edge cases." },
      { type: "h2", id: "cheatsheet", text: "The one-line rules" },
      { type: "ul", items: [
        "<strong>JPG</strong> — photos, and anywhere you need broad compatibility. Small files, imperceptible quality loss at 80–90%, no transparency.",
        "<strong>PNG</strong> — anything with sharp edges, text, or transparency. Larger files, but pixel-perfect.",
        "<strong>WEBP</strong> — the modern default for websites. Smaller than JPG for photos, smaller than PNG for graphics, supports transparency. Every current browser supports it.",
      ] },
      { type: "p", html: 'You can switch between all three in the browser with <a href="/tools/image-converter" class="text-signal underline underline-offset-2">Image Converter</a>. Under the hood it&apos;s all just re-encoding — you&apos;re not gaining or losing anything except file size and the specific compromises each format makes.' },
      { type: "h2", id: "jpg", text: "JPG: the workhorse for photographs" },
      { type: "p", html: "JPG uses lossy compression. It throws away data that human eyes are bad at noticing — subtle color variations, high-frequency detail in busy areas — and squeezes what's left. On a photograph this is basically invisible up to about quality 80. Above 90 you're paying for bytes you can't see; below 60 you start noticing block artifacts, especially on smooth gradients like sky." },
      { type: "p", html: "Where JPG genuinely fails is anywhere with sharp geometry: logos, text, screenshots of UIs, line drawings. The compression treats sharp edges as noise and blurs them into a soft halo. This is why the internet used to be full of JPG screenshots that looked like they were photographed through a jar of Vaseline." },
      { type: "p", html: "JPG doesn't support transparency at all. If you save a transparent PNG as JPG, the transparent pixels get flattened to white (or whatever your background color is)." },
      { type: "figure", src: "/blog/blog-jpg-png-webp-hero.jpg", alt: "Comparison of the same photograph rendered as JPG, PNG, and WEBP.", caption: "For photographs, the three formats look essentially identical at reasonable quality settings. The difference is size." },
      { type: "h2", id: "png", text: "PNG: when every pixel matters" },
      { type: "p", html: "PNG is lossless. Save a PNG, open it, save it again — the pixels are byte-for-byte identical. That's a big deal for graphics with sharp edges, because there's no compression halo, no color banding, no soft mush around your logo's serifs." },
      { type: "p", html: "PNG also supports full alpha transparency, which is the technical way of saying you can have partly-transparent pixels — for soft shadows, feathered edges, glass effects. GIF only supports on/off transparency (a pixel is either 100% visible or 100% invisible), which is why PNG replaced it for basically every use case that wasn't animation." },
      { type: "p", html: "The trade-off is size. A photo saved as PNG is typically 5–10x larger than the same photo as JPG at 85% quality. For the human eye, the extra bytes buy nothing. For a solid-color logo or a screenshot of a code editor, those same bytes buy you crisp pixels." },
      { type: "h2", id: "webp", text: "WEBP: the format that quietly won" },
      { type: "p", html: 'WEBP is Google&apos;s image format from 2010 that finally got universal browser support around 2020. It does both lossy and lossless compression, supports transparency, and — the interesting part — is meaningfully smaller than JPG or PNG at the same visual quality. Rough numbers from <a href="https://developers.google.com/speed/webp/docs/webp_study" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">Google&apos;s original comparison</a>: about 25–35% smaller than JPG for photos, and 25% smaller than PNG for graphics.' },
      { type: "p", html: 'Every modern browser has supported WEBP since around 2020. macOS Preview handles it, Windows 11 handles it, iOS and Android render it inline. The main compatibility holes now are ancient email clients and some print workflows. For the web, WEBP is essentially the default — WordPress, Cloudflare, and every modern CDN will happily serve WEBP variants automatically.' },
      { type: "p", html: 'The one place I&apos;d still hesitate is when you&apos;re handing an image to a partner who&apos;ll open it in an older desktop tool. Send JPG or PNG in that case; convert to WEBP for your own web use via <a href="/tools/image-converter" class="text-signal underline underline-offset-2">Image Converter</a>.' },
      { type: "h2", id: "concrete-rules", text: "Concrete rules for common jobs" },
      { type: "h3", id: "web-photos", text: "Photos on a website" },
      { type: "p", html: 'WEBP at quality 80. If your CMS won&apos;t take WEBP, JPG at quality 82. Then run it through <a href="/tools/compress-image" class="text-signal underline underline-offset-2">Compress Image</a> if the file is still bigger than 300 KB.' },
      { type: "h3", id: "logos", text: "Logos and icons" },
      { type: "p", html: "SVG if you have the source (infinitely scalable, tiny file). Otherwise PNG with transparency, or lossless WEBP. Never JPG — the edges of a JPG logo will look like they've been photographed on a rainy morning." },
      { type: "h3", id: "screenshots", text: "Screenshots of UIs, code, documents" },
      { type: "p", html: "PNG or lossless WEBP. JPG will smear the text and add a halo around every icon edge. If file size is a problem, compress the PNG with a lossy PNG tool rather than switching to JPG." },
      { type: "h3", id: "product-photos", text: "Product photos with transparent backgrounds" },
      { type: "p", html: 'PNG for maximum compatibility, WEBP for web-only use. If you started with a JPG and need transparency, you first need to <a href="/tools/remove-background" class="text-signal underline underline-offset-2">remove the background</a>, then export the result as PNG or WEBP — a JPG can&apos;t hold transparent pixels no matter how hard you try.' },
      { type: "h3", id: "email", text: "Images for email" },
      { type: "p", html: "JPG or PNG. WEBP support in email clients is still spotty — Outlook in particular. Not worth the risk for a marketing send." },
      { type: "h2", id: "closing", text: "The pattern to remember" },
      { type: "p", html: "Content type drives format. Photos want JPG or WEBP because lossy compression is a good deal on real-world imagery. Graphics with sharp edges want PNG or lossless WEBP because those same edges are what JPG destroys. Transparency needs PNG or WEBP because JPG doesn't support it. WEBP wins on file size against both, so it's the modern default anywhere it's supported." },
      { type: "p", html: "Convert freely between all three — there's no meaningful accuracy loss going from PNG to WEBP (both lossless) or from JPG to WEBP (both lossy, comparable settings). Just don't go from PNG to JPG and back; you lose transparency and eat a small quality hit each round trip." },
    ],
    faqs: [
      { q: "Is WEBP better than JPG?", a: "For file size, yes — WEBP is typically 25–35% smaller than JPG at equivalent visual quality. For compatibility, JPG still wins in older tools and email clients. On the modern web, WEBP is the better default." },
      { q: "Why is my PNG file so large?", a: "PNG is lossless, which is great for sharp graphics but costly for photos with millions of subtle color variations. For photos you almost always want JPG or WEBP; save PNG for logos, text, and images with transparency." },
      { q: "Can I convert JPG to PNG to get better quality?", a: "No. Converting JPG to PNG preserves whatever quality the JPG had — you can't recover detail that was thrown away during JPG compression. Convert to PNG only if you need lossless further editing or transparency support." },
      { q: "Does converting between formats lose quality?", a: "Between lossless formats (PNG ↔ lossless WEBP), no loss. From a lossy format (JPG) to any other format, no additional loss beyond what the JPG already had. Repeatedly re-saving as JPG or lossy WEBP does compound quality loss." },
    ],
    cta: { toolSlug: "image-converter", heading: "Convert between JPG, PNG, and WEBP", body: "Image Converter switches formats and adjusts quality — batch convert a whole folder if you like. Everything runs in your browser." },
    sources: [
      { label: "Google — WebP compression study", href: "https://developers.google.com/speed/webp/docs/webp_study" },
      { label: "MDN — Image file type and format guide", href: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types" },
    ],
  },

  {
    slug: "how-to-sign-a-pdf-without-printing",
    title: "How to Sign a PDF Without Printing It Out",
    description: "A step-by-step guide to adding a real-looking signature to a PDF using only your browser — draw with the trackpad, type in a script font, or upload an image of your signature.",
    summary: "You don't need Acrobat, DocuSign, or a printer. Open the Sign PDF tool, draw or type your signature, drag it onto the page, and download. The signed PDF is legally valid for most everyday agreements in the US, UK, and EU.",
    date: "2026-07-22",
    readMinutes: 7,
    tags: ["PDF", "E-signature", "How-to"],
    hero: { src: "/blog/blog-sign-pdf-hero.jpg", alt: "Illustration of a hand holding a stylus and signing a floating PDF document with an orange cursive signature." },
    body: [
      { type: "p", html: "The old workflow — print the PDF, sign it with a pen, scan it back in — is somehow still common in 2026. It's also completely unnecessary. Every modern e-signature workflow for everyday agreements (freelance contracts, rental leases, offer letters, permission slips) runs perfectly well from a browser tab. Here's how to do it, plus a short note on when this stops being sufficient." },
      { type: "h2", id: "how-to", text: "The three-minute version" },
      { type: "ol", items: [
        'Open <a href="/tools/sign-pdf" class="text-signal underline underline-offset-2">Sign PDF</a>.',
        "Drop your PDF onto the drop zone.",
        "Draw your signature with the trackpad or mouse, type your name in a script font, or upload an image of your signature (a photo of one you signed on paper works fine).",
        "Drag the signature onto the correct spot on the page. Resize it by dragging a corner. Add more than one if the document needs initials on other pages.",
        "Click Download. You get a signed PDF, saved locally, with your signature embedded as part of the page — not a separate layer that could be stripped off.",
      ] },
      { type: "p", html: "That's the whole thing. The signature is baked into the PDF the same way any drawn element would be. Anyone opening the file — including someone using a different tool — sees the signature exactly where you put it." },
      { type: "h2", id: "which-method", text: "Draw, type, or upload — which looks best?" },
      { type: "p", html: "Three options, and they all have use cases." },
      { type: "h3", id: "draw", text: "Drawing with the trackpad" },
      { type: "p", html: "Looks the most like a real signature and takes about ten seconds. The catch: trackpad signatures always look a bit shaky compared to pen-on-paper, because a trackpad is a coarse input device. That's fine for informal documents. If you have an iPad or a drawing tablet, use it — the result is indistinguishable from ink." },
      { type: "h3", id: "type", text: "Typing in a script font" },
      { type: "p", html: "Looks the most consistent but also the most obviously typed. Works well for internal documents, less well for anything that will be scrutinized by a bank or a lawyer. On the plus side, it's completely legible, which matters more than people expect." },
      { type: "h3", id: "upload", text: "Uploading a photo of a real signature" },
      { type: "p", html: "This is the pro move. Sign a piece of paper once, take a phone photo with even lighting, and you have a clean signature you can reuse forever. It looks real because it is real. Save the file somewhere and drop it in whenever you need to sign something." },
      { type: "p", html: 'Tip: if your photo has a colored background, run it through <a href="/tools/remove-background" class="text-signal underline underline-offset-2">Remove Background</a> first. You want a transparent PNG so the signature sits cleanly on top of the PDF, no white box around it.' },
      { type: "figure", src: "/blog/blog-sign-pdf-hero.jpg", alt: "A stylus adding a cursive signature to a PDF document.", caption: "An uploaded photo of a real signature is the most convincing option." },
      { type: "h2", id: "multi-page", text: "Signing multi-page documents" },
      { type: "p", html: "Contracts often want your initials on every page and a full signature on the last. Add one signature block, drag it onto page 1, then duplicate it (or add a second, smaller one) and place it on every page that needs initials. The tool lets you scroll through pages and drop signatures wherever you like — including on the same page in multiple spots." },
      { type: "p", html: 'If the document is very long and you&apos;re only editing a few pages, you can extract just those pages with <a href="/tools/split-pdf" class="text-signal underline underline-offset-2">Split PDF</a>, sign the smaller file, and either send back just the signed pages or <a href="/tools/merge-pdf" class="text-signal underline underline-offset-2">merge</a> the signed subset back into the full document. Sometimes faster than scrolling through 40 pages.' },
      { type: "h2", id: "legal", text: "Is a browser-signed PDF legally valid?" },
      { type: "p", html: "The short answer: for the vast majority of everyday agreements, yes. This isn't legal advice, but the framework is well-established. In the US, the <a href=\"https://www.fdic.gov/regulations/compliance/manual/10/x-3.1.pdf\" target=\"_blank\" rel=\"noreferrer\" class=\"text-signal underline underline-offset-2\">ESIGN Act (2000)</a> gave electronic signatures the same legal status as ink signatures for almost all commercial and consumer contracts. In the EU, <a href=\"https://digital-strategy.ec.europa.eu/en/policies/eidas-regulation\" target=\"_blank\" rel=\"noreferrer\" class=\"text-signal underline underline-offset-2\">eIDAS</a> defines three tiers of e-signature, and a plain image-of-signature-on-PDF counts as a &quot;simple electronic signature&quot; — legally binding for most business use, though weaker than certificate-based signatures for high-stakes work." },
      { type: "p", html: "Where you do need something stronger:" },
      { type: "ul", items: [
        "Real estate transactions, wills, and some family-law documents in the US — often require notarization or specific witness procedures.",
        "Cross-border commercial contracts where jurisdiction is uncertain — a certificate-based signature (with a trusted timestamp) is safer.",
        "Anything a bank or government agency has an opinion about — check their specific requirements. Some accept an image-of-signature, some don&apos;t.",
      ] },
      { type: "p", html: "For a freelance contract, a rental application, a permission slip, a signed NDA between two small companies, a &quot;yes I accept this proposal&quot; — a browser-signed PDF is completely fine and is exactly what most of the world has been doing since the pandemic." },
      { type: "h2", id: "privacy", text: "One more thing about privacy" },
      { type: "p", html: 'Signatures are, by nature, personal data. The Sign PDF tool runs entirely in your browser — the file never uploads, your signature never uploads, nothing is stored on our end. That&apos;s not marketing copy; it&apos;s just the architecture. If you&apos;re signing a document that mentions financials, health, or anything else sensitive, this matters. Same story for everything on <a href="/" class="text-signal underline underline-offset-2">EasyFileMagic</a>.' },
    ],
    faqs: [
      { q: "Is a PDF signed in a browser legally binding?", a: "For most everyday agreements in the US (ESIGN Act) and EU (eIDAS), yes — a drawn or image-based signature on a PDF is a valid electronic signature. High-stakes documents like real estate transfers or wills often require additional formalities like notarization. This isn't legal advice; check specific requirements for your jurisdiction and document type." },
      { q: "Can someone remove or edit my signature after I sign?", a: "The Sign PDF tool bakes the signature into the page content, so it can't be trivially removed. However, no image-based signature is tamper-proof — anyone with a PDF editor could obscure or replace it. For high-value documents, use certificate-based signing (Adobe Sign, DocuSign) which cryptographically seals the file." },
      { q: "Do I need to buy DocuSign or Adobe Sign?", a: "Not for most personal and small-business signing. Browser-based tools produce a valid electronic signature at no cost. Paid services add features like signing workflows, audit trails, and certificate-based cryptographic seals — worth it if you sign at volume or need those specific features." },
      { q: "Is my signature uploaded when I sign a PDF online?", a: "It depends on the tool. EasyFileMagic's Sign PDF runs entirely in your browser — nothing uploads. Some other online signing tools do upload files to a server; check their privacy policy before signing sensitive documents." },
    ],
    cta: { toolSlug: "sign-pdf", heading: "Sign a PDF in under a minute", body: "Draw, type, or upload a signature and drag it onto any page. The signed PDF is generated locally in your browser and never uploaded." },
    sources: [
      { label: "US ESIGN Act — FDIC summary (PDF)", href: "https://www.fdic.gov/regulations/compliance/manual/10/x-3.1.pdf" },
      { label: "European Commission — eIDAS Regulation", href: "https://digital-strategy.ec.europa.eu/en/policies/eidas-regulation" },
    ],
  },

  {
    slug: "ocr-explained-scanned-document-to-editable-text",
    title: "OCR Explained: How to Turn a Scanned Document or Photo Into Editable Text",
    description: "How OCR actually works, what accuracy you should realistically expect, and specific tips (lighting, angle, resolution) that dramatically improve results — plus a walkthrough with the browser-based OCR tool.",
    summary: "OCR (Optical Character Recognition) reads text out of images and scanned PDFs. Modern browser OCR hits 95–99% accuracy on clean printed text, dropping fast on handwriting, low light, and rotated images. Small changes to the source (contrast, resolution, angle) matter more than the tool you pick.",
    date: "2026-07-23",
    readMinutes: 8,
    tags: ["OCR", "Text", "How-to"],
    hero: { src: "/blog/blog-ocr-hero.jpg", alt: "Illustration of a magnifying-glass eye reading a scanned document, with letters lifting off the page as editable text." },
    body: [
      { type: "p", html: "You have a photo of a whiteboard, a scanned receipt, or a screenshot of a spec you can't copy from. The text is right there, just trapped inside pixels. OCR is the tool that turns those pixels back into words you can search, copy, and edit." },
      { type: "p", html: "What most people don't realize is how much the accuracy depends on the source image, not the OCR engine. A crisp scan of a printed document hits 99% in any modern OCR. A phone photo of a handwritten note in dim light hits maybe 60%. The tool is the same in both cases — the input isn't. Here's what's actually happening, and how to get the best results." },
      { type: "h2", id: "how-it-works", text: "How OCR actually works" },
      { type: "p", html: 'Modern OCR is a two-stage pipeline. First, a text-detection model finds regions of the image that <em>look like</em> text — rectangles of the right size and orientation with the right density of dark-on-light pixels. Second, a text-recognition model looks at each region and predicts the actual characters, one line at a time.' },
      { type: "p", html: 'The browser tool at <a href="/tools/ocr" class="text-signal underline underline-offset-2">EasyFileMagic OCR</a> uses <a href="https://tesseract.projectnaptha.com/" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">Tesseract</a>, an open-source engine that Google maintained and released years ago. It runs entirely in your browser via WebAssembly — no server upload, no queue. First run downloads the language data (English is about 10 MB); after that it&apos;s instant.' },
      { type: "p", html: "Both stages are AI models. Both make mistakes. The interesting question is what makes them mistake-prone." },
      { type: "h2", id: "accuracy", text: "What accuracy to actually expect" },
      { type: "p", html: "Rough numbers from my own use:" },
      { type: "ul", items: [
        "<strong>Clean scanned document, 300 DPI:</strong> 99%+ on printed text, occasional errors on complex layouts (tables, multi-column).",
        "<strong>Phone photo of a document in good light, held flat:</strong> 95–98%.",
        "<strong>Phone photo at an angle or in dim light:</strong> 80–95%, with occasional whole-line misreads.",
        "<strong>Screenshot of a UI at native resolution:</strong> 98–100% (best case — text is anti-aliased and pixel-perfect).",
        "<strong>Handwriting:</strong> 40–80%, wildly variable by handwriting style. Cursive is worse than block letters. English is much better supported than any other script.",
      ] },
      { type: "p", html: "In practical terms: for a scanned invoice, expect to skim the result and fix maybe two words. For a phone photo of a receipt, expect to fix five to ten. For a photo of your notebook, expect to more or less rewrite everything but at least the structure is captured." },
      { type: "figure", src: "/blog/blog-ocr-hero.jpg", alt: "A magnifying glass lifting characters out of a scanned page.", caption: "OCR is a two-stage process: find the text, then read it." },
      { type: "h2", id: "tips", text: "How to get much better results without switching tools" },
      { type: "p", html: "These are ranked by how much impact each one has." },
      { type: "h3", id: "resolution", text: "Resolution and sharpness" },
      { type: "p", html: "The single biggest factor. Text needs to be at least 20 pixels tall in the source image for reliable recognition. If you're scanning, use 300 DPI minimum — 400 for small print. If you're photographing, get close, tap to focus, and hold the phone steady. A blurry photo of a document destroys OCR accuracy no matter how good the engine is." },
      { type: "h3", id: "lighting", text: "Lighting and contrast" },
      { type: "p", html: "Even, diffuse light beats harsh directional light every time. A window on an overcast day is the ideal desk-photo setup. Harsh overhead light produces glare spots and deep shadows, and both eat characters. If contrast is low (yellowed paper, faint print), converting the image to high-contrast black-and-white before OCR helps a lot." },
      { type: "h3", id: "angle", text: "Angle and rotation" },
      { type: "p", html: "OCR engines handle small tilts (up to about 10°) automatically. Beyond that, straighten the image first — many phone camera apps have a document-scan mode that flattens perspective. A perfectly-flat page with straight lines works dramatically better than a tilted one." },
      { type: "h3", id: "cropping", text: "Cropping" },
      { type: "p", html: "Crop tight to just the text you care about. Big empty margins, decorative headers, or table borders can confuse the text-detection stage into missing lines or merging separate paragraphs." },
      { type: "h2", id: "pdf-workflow", text: "OCR-ing a multi-page PDF" },
      { type: "p", html: 'Scanned PDFs are basically photographs wrapped in PDF form — searching for a word inside them returns nothing, because the document has no text data, just images of text. The <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR tool</a> handles this: it rasterizes each page, runs OCR on it, and gives you the extracted text as a downloadable .txt file (or copy-to-clipboard for a single page).' },
      { type: "p", html: 'From there, if you want a searchable PDF rather than plain text, you can rebuild one using <a href="/tools/text-to-pdf" class="text-signal underline underline-offset-2">Text / Markdown to PDF</a>. You lose the visual layout, but you gain a small text-based PDF that&apos;s fully searchable, works with screen readers, and is a fraction of the size of the original scan.' },
      { type: "h2", id: "languages", text: "A note on languages other than English" },
      { type: "p", html: "Tesseract supports over 100 languages, but the accuracy varies enormously. English, German, French, Spanish, and other Latin-script languages with lots of training data are excellent. Chinese, Japanese, Korean are good with the appropriate language pack. Right-to-left scripts (Arabic, Hebrew) work but are more error-prone. Rare scripts and historic writing systems are a coin flip." },
      { type: "h2", id: "limits", text: "Where OCR still can't help you" },
      { type: "p", html: "Two cases you'll run into:" },
      { type: "ul", items: [
        "<strong>Handwritten cursive.</strong> Modern OCR is a lot better than it used to be, but cursive handwriting remains a hard problem. Specialised handwriting recognition (HWR) tools do slightly better, but nothing at consumer scale is reliable enough to trust unread.",
        "<strong>Text embedded in complex graphics.</strong> A logo with the company name curved around a shape, a poster with text over a busy photograph, ASCII art. OCR is optimised for rectangular text regions on plain backgrounds. Anything else struggles.",
      ] },
      { type: "p", html: "For those cases, the honest answer is to retype the text. Sometimes that's what's easiest." },
      { type: "h2", id: "workflow", text: "A realistic end-to-end workflow" },
      { type: "p", html: "You get a scanned PDF of a 20-page contract. You want to find the clause about termination but the PDF isn't searchable." },
      { type: "ol", items: [
        'Open <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR</a>, drop the PDF in, wait for it to process each page.',
        "Copy the extracted text into a text editor and search for &quot;terminate&quot; or &quot;termination.&quot;",
        "Jump back to the corresponding page in the original PDF to read the actual clause with its full formatting.",
      ] },
      { type: "p", html: "This is the pattern for basically every OCR job: the extracted text is a searchable index into the original, not a replacement for it." },
    ],
    faqs: [
      { q: "How accurate is browser-based OCR?", a: "95–99% accurate on clean printed text at reasonable resolution, dropping to 80–90% on phone photos of documents and 40–80% on handwriting. Accuracy depends far more on the source image quality than on the OCR engine itself." },
      { q: "Does OCR work on handwriting?", a: "Modern OCR handles clear block-letter handwriting reasonably well but struggles with cursive. If you need reliable handwriting recognition, expect to review and correct the output. Print handwriting scans cleanly; cursive rarely does." },
      { q: "Is my scanned document uploaded when I use OCR online?", a: "It depends on the tool. EasyFileMagic OCR runs entirely in your browser using Tesseract compiled to WebAssembly — nothing uploads. Some other online OCR services do upload files to a server; check their privacy policy for sensitive documents." },
      { q: "How do I make a scanned PDF searchable?", a: "Run the PDF through OCR to extract the text. Some tools produce a searchable PDF directly (text layer over the original page); others give you plain text you can search separately. Both approaches work — the searchable-PDF version keeps the visual layout." },
    ],
    cta: { toolSlug: "ocr", heading: "Turn a scan or photo into text", body: "OCR extracts text from images and scanned PDFs in your browser — copy it to the clipboard or download as a .txt file." },
    sources: [
      { label: "Tesseract OCR — Official documentation", href: "https://tesseract-ocr.github.io/tessdoc/" },
      { label: "MDN — WebAssembly overview", href: "https://developer.mozilla.org/en-US/docs/WebAssembly" },
    ],
  },

  {
    slug: "heic-photos-wont-open-on-windows-android-fix",
    title: "HEIC Photos Won't Open on Windows or Android? Here's the Fix",
    description: "Why iPhones save photos as HEIC, what makes it a compatibility headache on Windows and Android, and the fastest ways to convert HEIC to JPG or PNG without installing anything.",
    summary: "iPhones save photos as HEIC by default — it's smaller than JPG at the same quality but many non-Apple systems can't open it. The fastest fix is to drop the file into a browser-based HEIC to JPG converter; the alternative is to change the iPhone setting so future photos are saved as JPG.",
    date: "2026-07-24",
    readMinutes: 6,
    tags: ["Images", "HEIC", "iPhone"],
    hero: { src: "/blog/blog-heic-hero.jpg", alt: "Illustration showing an iPhone with a HEIC photo, an arrow, and a Windows/Android device receiving the same photo as JPG." },
    body: [
      { type: "p", html: "Someone AirDrops you a photo from their iPhone. You email it to yourself, or drop it into a Windows folder, and get a message like &quot;Windows can't open this file&quot; or &quot;The photo could not be displayed.&quot; The file has a .heic or .heif extension you've never seen before. Nothing is broken — this is HEIC being HEIC, and it's a five-second fix." },
      { type: "h2", id: "why", text: "Why iPhones use HEIC in the first place" },
      { type: "p", html: 'HEIC stands for High Efficiency Image Coding. It&apos;s the file wrapper for a modern image codec (HEVC) that produces roughly half the file size of JPG at the same visual quality. Apple switched to it as the iPhone default in iOS 11 (2017) because iPhone photos were getting big — a 12 MP photo is a lot of data, and doubling storage headroom for free is a good deal.' },
      { type: "p", html: 'The catch: the compression technology behind HEIC is <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">covered by patents</a> that make it awkward for open-source tools and non-Apple operating systems to support out of the box. Windows added HEIC support behind a paid codec extension. Android added it in version 10 for viewing but not always for sharing. Web browsers still don&apos;t render HEIC inline. So a file that&apos;s completely native on an iPhone becomes a compatibility puzzle everywhere else.' },
      { type: "h2", id: "quick-fix", text: "The fastest fix: convert to JPG" },
      { type: "p", html: 'Drop your HEIC files into <a href="/tools/heic-to-jpg" class="text-signal underline underline-offset-2">HEIC to JPG</a> and you get JPGs (or PNGs) back in a couple of seconds. Batch it — drop a whole folder of HEICs at once and it&apos;ll bundle the results into a ZIP. Everything runs in your browser via WebAssembly, no server upload, no account.' },
      { type: "p", html: "Why JPG rather than something newer? Because JPG opens absolutely everywhere. If you're converting to fix a compatibility issue, you want the format with the widest compatibility — that's JPG, still, in 2026. If you're archiving photos and don't need to share them, WEBP is a better choice (smaller and modern), but for the &quot;send it to my mum's Windows laptop&quot; case, JPG is right." },
      { type: "figure", src: "/blog/blog-heic-hero.jpg", alt: "An iPhone HEIC photo being converted to JPG for a Windows or Android device.", caption: "HEIC on iOS, JPG for everything else. Two clicks, no install." },
      { type: "h2", id: "iphone-setting", text: "Make future iPhone photos save as JPG" },
      { type: "p", html: "If you send photos to non-Apple devices often, change the iPhone setting so the camera saves JPG by default:" },
      { type: "ol", items: [
        "Open <strong>Settings</strong> on the iPhone.",
        "Tap <strong>Camera → Formats</strong>.",
        "Switch from <em>High Efficiency</em> to <em>Most Compatible</em>.",
      ] },
      { type: "p", html: "New photos will save as JPG. Old photos on the phone stay HEIC unless you convert them. There's a trade-off — your photos will take about twice the storage — but for many people the compatibility is worth it." },
      { type: "p", html: "Alternatively, keep the High Efficiency setting and rely on iOS to auto-convert when you share. iOS <em>usually</em> converts HEIC to JPG automatically when you email or message a photo to a non-Apple destination. AirDrop between Apple devices keeps HEIC; email attachments to Windows friends convert to JPG. When it works, it's invisible. When it doesn't, you're back to the manual fix." },
      { type: "h2", id: "windows-fix", text: "The Windows-only workaround" },
      { type: "p", html: "If you regularly receive HEIC and stay on Windows, Microsoft's HEIF Image Extensions plugin (free from the Microsoft Store) lets File Explorer thumbnail and open HEIC files. It works, and once installed you'll basically forget HEIC exists. Note that the HEVC video codec is a separate paid extension, so HEIC videos are a different problem." },
      { type: "p", html: "For occasional HEIC files, though, browser conversion is faster than installing a Windows extension. Especially if the file is on a device you don't control." },
      { type: "h2", id: "android", text: "Android and HEIC" },
      { type: "p", html: "Android 10+ can display HEIC natively, so viewing usually works. Sharing is patchier — some apps convert automatically, some don't. The universal answer is the same: drop the file into a browser converter and send JPG onwards. Works on Android's browser too, since the whole thing runs client-side." },
      { type: "h2", id: "quality", text: "Does converting HEIC to JPG lose quality?" },
      { type: "p", html: "Yes, but by less than you'd think. HEIC's compression is more efficient than JPG's, so re-encoding as JPG at high quality (say, 90+) gives you a slightly larger file with visually indistinguishable results. At default quality settings, the difference is usually invisible outside of very specific test conditions (large flat gradients, extreme close-ups)." },
      { type: "p", html: 'For photos you care about — wedding shots, portfolio work — export at JPG quality 95 or higher for maximum fidelity. For everyday sharing, default settings are fine. Either way, if the resulting JPG is too big, run it through <a href="/tools/compress-image" class="text-signal underline underline-offset-2">Compress Image</a> to bring it back down.' },
      { type: "h2", id: "batch", text: "The pattern for large exports" },
      { type: "p", html: "If you've just returned from a trip with a few hundred HEICs to share:" },
      { type: "ol", items: [
        "Export the HEICs from Photos (or copy them off the phone).",
        'Drop the whole set into <a href="/tools/heic-to-jpg" class="text-signal underline underline-offset-2">HEIC to JPG</a>; download the ZIP.',
        'Optional: resize/compress with <a href="/tools/compress-image" class="text-signal underline underline-offset-2">Compress Image</a> if you plan to email them.',
        'Bundle into a single deliverable — email the ZIP, or if you want a single document, bundle into a PDF via <a href="/tools/image-to-pdf" class="text-signal underline underline-offset-2">Image to PDF</a>.',
      ] },
      { type: "p", html: "That's basically the whole workflow. HEIC isn't a bad format — it's just a format that hasn't reached universal support yet. Convert as needed, and consider changing your iPhone setting if you're doing it more than once a month." },
    ],
    faqs: [
      { q: "Why does my iPhone save photos as HEIC instead of JPG?", a: "HEIC is Apple's default because it produces roughly half-size files at the same visual quality as JPG. You can change this in Settings → Camera → Formats → Most Compatible if you want new photos to save as JPG instead." },
      { q: "Can Windows open HEIC files?", a: "Not by default. Windows needs the HEIF Image Extensions from the Microsoft Store (free) to open HEIC directly. Alternatively, convert the file to JPG using a browser-based tool — no install required." },
      { q: "Does converting HEIC to JPG lose quality?", a: "There's a small quality loss on re-encoding, but at JPG quality 90 or higher the difference is visually imperceptible on typical photos. For maximum fidelity, use quality 95+." },
      { q: "Are HEIC and HEIF the same thing?", a: "Effectively yes. HEIF is the file format (High Efficiency Image File Format), HEIC is the specific variant Apple uses (HEIF with HEVC-compressed images). File extensions .heic and .heif are used interchangeably." },
    ],
    cta: { toolSlug: "heic-to-jpg", heading: "Convert HEIC to JPG in your browser", body: "Drop iPhone photos into HEIC to JPG and get compatible files back. Batch conversion supported — everything runs locally." },
    sources: [
      { label: "Apple — About Camera formats on iPhone", href: "https://support.apple.com/en-us/HT207022" },
      { label: "MDN — Image file type and format guide", href: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types" },
    ],
  },

  {
    slug: "how-to-password-protect-a-pdf",
    title: "How to Password Protect a PDF (and When You Should)",
    description: "A practical guide to adding passwords to PDFs — how strong PDF encryption actually is, when it's worth the friction, and how to protect or unlock a PDF entirely in your browser.",
    summary: "Modern PDF encryption (AES-256) is strong enough that a well-chosen password cannot be brute-forced in any reasonable time. It's a real security measure for documents in transit — worth using for financial statements, HR letters, and anything you'd normally send via encrypted mail.",
    date: "2026-07-25",
    readMinutes: 7,
    tags: ["PDF", "Security", "Privacy"],
    hero: { src: "/blog/blog-protect-pdf-hero.jpg", alt: "Illustration of a heavy padlock closing a PDF document, with keys hanging on a workshop pegboard behind." },
    body: [
      { type: "p", html: "Password-protecting a PDF is one of those features that seems mildly redundant right up until you actually need it. You email a bank statement to your accountant. You send an offer letter to a candidate. You share a report full of internal numbers with an external contractor. Any of those could sit in a mailbox for a decade — password protection is what keeps a leaked email archive from becoming a leaked document." },
      { type: "p", html: "The nice thing is it takes about ten seconds and the encryption is genuinely strong. Here's when it's worth doing, and how to do it without installing anything." },
      { type: "h2", id: "how-strong", text: "How strong is PDF encryption, actually?" },
      { type: "p", html: 'PDF 2.0 (2017 onwards) uses AES-256 encryption, the same standard the US government uses for classified data. With a good password — 12+ characters, mix of types, not a dictionary word — brute-forcing it would take longer than the current age of the universe on any hardware available today. This is real crypto, not security theater.' },
      { type: "p", html: 'The weak link is always the password, not the algorithm. &quot;Summer2024!&quot; is trivially guessable to any modern cracking tool. A random 12-character password from a manager (like <a href="https://1password.com/" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">1Password</a> or your browser&apos;s built-in) is not. Pick the second kind.' },
      { type: "p", html: "There's also a weaker legacy mode (RC4-based, from older PDF versions) that <em>can</em> be cracked in some scenarios. If you're using a modern tool from 2020 onwards, you're almost certainly getting AES-256; older tools may default to weaker settings. Worth checking the encryption options if the document is important." },
      { type: "h2", id: "when-to-protect", text: "When you should actually password-protect a PDF" },
      { type: "p", html: "The rule of thumb: password-protect anything that would be a problem if it appeared in a screenshot of a leaked email archive." },
      { type: "ul", items: [
        "<strong>Financial documents.</strong> Tax returns, bank statements, salary letters, expense reports.",
        "<strong>Legal documents.</strong> Contracts, NDAs, settlement agreements — especially between parties who don&apos;t share an email domain.",
        "<strong>Health information.</strong> Test results, medical records, insurance forms. Regulated in many jurisdictions.",
        "<strong>HR letters.</strong> Offers, promotions, warnings, terminations, references.",
        "<strong>Anything with someone else&apos;s personal data.</strong> ID numbers, addresses, dates of birth. Not just a courtesy — often a legal requirement.",
      ] },
      { type: "p", html: 'When you don&apos;t need to bother: internal documents shared inside a company with SSO-protected drives, public brochures, invoices to established clients over encrypted mail. Password protection has friction — the recipient needs the password — so add it where it&apos;s doing real work.' },
      { type: "h2", id: "how-to-do-it", text: "Adding a password (three-click version)" },
      { type: "ol", items: [
        'Open <a href="/tools/protect-pdf" class="text-signal underline underline-offset-2">Protect / Unlock PDF</a>.',
        "Drop your PDF in and pick Protect mode.",
        "Enter a strong password — 12+ characters, generated ideally. Confirm and click Protect.",
        "Download the protected copy.",
      ] },
      { type: "p", html: "Send the PDF and the password separately. This sounds paranoid until you consider that leaked email dumps typically leak whole threads at a time; the password in a different channel (Signal, SMS, a phone call) means the leaked PDF isn't openable." },
      { type: "figure", src: "/blog/blog-protect-pdf-hero.jpg", alt: "A large padlock securing a PDF file, with keys hanging behind on a pegboard.", caption: "A strong password on a PDF is real security, not a speed bump." },
      { type: "h2", id: "unlocking", text: "Removing a password from a PDF you own" },
      { type: "p", html: 'The same tool has an Unlock mode. Drop in a password-protected PDF, enter the password, and download an unprotected copy. Useful when you want to compress or edit the file — most other PDF tools refuse to touch encrypted files, so unlocking first is often step one of a longer workflow.' },
      { type: "p", html: "Important, obvious note: this only works if you have the password. There is no &quot;remove protection without the password&quot; option. That would be, definitionally, breaking the encryption — which for AES-256 isn't a thing anyone can do on demand. If a website claims to unlock protected PDFs without a password, they're either lying or the PDF was using weak legacy encryption." },
      { type: "h2", id: "client-side", text: "Why running this in your browser matters more than usual" },
      { type: "p", html: 'A password-protection tool that runs on a server sees your password. So does one that runs the encryption on their end. If the point of the exercise is to keep the document confidential, uploading it to a random SaaS to be encrypted is the opposite of what you want.' },
      { type: "p", html: 'The <a href="/tools/protect-pdf" class="text-signal underline underline-offset-2">Protect / Unlock PDF</a> tool runs entirely in your browser tab, using PDF-lib and WebCrypto. Your PDF and your password never leave the device. This is the setting that actually matters when you&apos;re handling sensitive documents.' },
      { type: "h2", id: "what-passwords-dont-do", text: "What password protection doesn't do" },
      { type: "p", html: "A password protects a file in transit and at rest. It doesn't protect against:" },
      { type: "ul", items: [
        "The recipient forwarding the unlocked PDF to someone else after they open it.",
        "Someone with the password taking a screenshot or printing the document.",
        "Sophisticated attackers who compromise the recipient's device.",
      ] },
      { type: "p", html: "If you need durable rights management — controlling who can print, copy, or share the content after opening — you're looking at enterprise DRM systems like Adobe Content Server or Microsoft Information Protection. Those come with their own costs and complexity. For everyday sensitive documents, a strong password is the right level of protection." },
      { type: "h2", id: "workflow", text: "A realistic workflow" },
      { type: "p", html: "You need to send a candidate their offer letter." },
      { type: "ol", items: [
        'Draft the letter, export as PDF from Word or Google Docs.',
        'Protect it with a strong random password in <a href="/tools/protect-pdf" class="text-signal underline underline-offset-2">Protect / Unlock PDF</a>.',
        'Email the protected PDF.',
        'Message the password separately over SMS or a chat app.',
      ] },
      { type: "p", html: "That's it. A minute of work, and even if the email leaks a decade from now, the salary number stays out of reach." },
      { type: "h2", id: "before-you-send", text: "Two things worth doing before you protect" },
      { type: "p", html: 'Encryption locks a file, it does not shrink it — and an encrypted PDF cannot be recompressed later without the password. If the document carries scans or high-resolution images, run it through <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a> <em>before</em> you add the password, so the recipient gets a file their mail server will actually accept.' },
      { type: "p", html: 'If the offer letter needs a countersignature, add it first with <a href="/tools/sign-pdf" class="text-signal underline underline-offset-2">Sign PDF</a> — drawing a signature onto an already-encrypted file means unlocking, signing, and re-protecting it. And if you are bundling the letter with a contract or handbook, <a href="/tools/merge-pdf" class="text-signal underline underline-offset-2">Merge PDF</a> them into one document first so there is a single password to communicate rather than three.' },
    ],

    faqs: [
      { q: "Is a password-protected PDF actually secure?", a: "With a strong random password and modern AES-256 encryption, yes — the encryption itself is uncrackable with current technology. Weakness comes from bad passwords (guessable, reused) or from older PDFs using legacy RC4 encryption." },
      { q: "Can someone remove the password without knowing it?", a: "No, if the PDF uses modern AES-256 encryption. Any online service claiming to unlock PDFs without the password is either lying, exploiting weak legacy encryption, or asking you to hand over the password itself." },
      { q: "What makes a strong PDF password?", a: "12 or more characters, generated randomly (not chosen by you), including a mix of upper, lower, digits, and symbols. Password managers generate exactly this. Avoid dictionary words, dates, and anything reused from other accounts." },
      { q: "Do I have to install software to password-protect a PDF?", a: "No. Browser-based tools using PDF-lib and WebCrypto can add AES-256 encryption entirely on your device — nothing uploads, no install, no account. That's actually more secure than a server-side tool, since your password stays local." },
    ],
    cta: { toolSlug: "protect-pdf", heading: "Protect a PDF in ten seconds", body: "Add or remove a password on any PDF, entirely in your browser. Uses AES-256, the same encryption standard governments use for sensitive data." },
    sources: [
      { label: "Adobe — PDF 2.0 encryption specification", href: "https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf" },
      { label: "NIST — Recommendation for the AES Cipher (FIPS 197)", href: "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf" },
    ],
  },

  {
    slug: "compress-pdf-what-actually-happens",
    title: "Compress a PDF Without Losing Quality: What Actually Happens When You Compress",
    description: "A deep dive into what PDF compression is really doing — image downsampling, font subsetting, stream re-encoding — and what size reductions are realistic on different kinds of documents.",
    summary: "PDF compression mostly means re-encoding embedded images at lower resolution and quality, plus subsetting embedded fonts. Text-only PDFs barely change; image-heavy PDFs can drop 80–90%. If a compressor isn't shrinking your file, the file probably doesn't have much fat to trim.",
    date: "2026-07-26",
    readMinutes: 8,
    tags: ["PDF", "Compression", "Deep-dive"],
    hero: { src: "/blog/blog-compress-inside-hero.jpg", alt: "Illustration of a PDF being pressed through a hand-cranked workshop press, with image thumbnails escaping like steam as the compressed PDF comes out." },
    body: [
      { type: "p", html: 'PDF compression has a slightly magical reputation — you drop in a 40 MB file, get back a 4 MB file, and everything looks the same. What&apos;s actually going on isn&apos;t magic. It&apos;s a specific set of operations on the internal contents of the PDF, and understanding them helps you know when to expect huge savings and when to stop trying.' },
      { type: "h2", id: "anatomy", text: "The anatomy of a PDF" },
      { type: "p", html: "A PDF is basically a collection of numbered objects. Some objects are pages (which reference other objects for their content). Some are text streams (compressed blocks of text-drawing instructions). Some are embedded images. Some are fonts. There's an index at the end that says where each object lives in the file." },
      { type: "p", html: "Compression targets each of these differently. And the ratio of image-to-text-to-font data in your specific PDF is what determines how much can actually be saved." },
      { type: "h2", id: "images", text: "1. Image downsampling and re-encoding (usually the big win)" },
      { type: "p", html: 'A PDF from a scanner or a designer often contains images that are much higher-resolution than any reader will ever display. A 4000×3000 pixel photo embedded on a page that&apos;s 8.5 by 11 inches at 72 DPI (screen viewing) doesn&apos;t need to be 4000 pixels wide — it just needs to be about 600. The extra pixels are pure waste.' },
      { type: "p", html: '<strong>Downsampling</strong> means resizing the embedded images to a target DPI — usually 150 for &quot;balanced&quot; presets, 100 for &quot;tiny&quot; ones. That alone can shrink a file 5–10x when it&apos;s photo-heavy.' },
      { type: "p", html: "<strong>Re-encoding</strong> means changing the compression on each image. Photos usually get re-saved as JPEG at quality 75–85; screenshots and diagrams as PNG or as JPEG-XL. Even at the same resolution, this can meaningfully reduce size because many source images were saved at wasteful high-quality settings." },
      { type: "figure", src: "/blog/blog-compress-inside-hero.jpg", alt: "A workshop press compressing a PDF, with image thumbnails flying off.", caption: "Image downsampling is where the big size reductions come from." },
      { type: "h2", id: "fonts", text: "2. Font subsetting" },
      { type: "p", html: 'A modern font file can be a couple of megabytes — thousands of glyphs, hinting tables, ligature rules. Most PDFs use maybe 200 of those glyphs. <strong>Subsetting</strong> means embedding only the glyphs the document actually uses.' },
      { type: "p", html: 'Well-authored PDFs are already subsetted, but plenty aren&apos;t. Word&apos;s default PDF export used to embed full fonts, and many CAD tools still do. A 40-page report with 15 unsubsetted fonts can carry 40+ MB of pure font data.' },
      { type: "p", html: "Compression tools re-subset the fonts, dropping unused glyphs. The saving depends entirely on how bad the original was. On a professionally-exported PDF: negligible. On a Word-with-Comic-Sans-and-fourteen-decorative-fonts PDF: enormous." },
      { type: "h2", id: "streams", text: "3. Stream compression" },
      { type: "p", html: "PDF content streams (the actual page-drawing instructions) are supposed to be compressed with the Flate algorithm (essentially zip/deflate). Occasionally you'll find a PDF with uncompressed or badly-compressed streams — usually from a manually-authored file or an old-school exporter. Re-compressing them gains 10–30% on the text portion of the file." },
      { type: "p", html: "This is usually a minor saving in absolute terms — text-only PDFs are small to begin with. But it's essentially free, so any decent compressor does it." },
      { type: "h2", id: "objects", text: "4. Duplicate object removal" },
      { type: "p", html: "Sometimes the same image is embedded twenty times (a company logo on every page, for instance) because the exporting tool didn't notice. A good compressor deduplicates: the logo becomes one object, and all twenty pages reference it. Similar deduplication happens with color profiles, form fields, and named destinations. Rarely a huge win, but real." },
      { type: "h2", id: "realistic", text: "What savings to actually expect" },
      { type: "p", html: "Rough numbers from my own use:" },
      { type: "ul", items: [
        "<strong>Text-only PDF (invoice, letter, plain report):</strong> 0–10% saving. It&apos;s already small.",
        "<strong>Business report with some charts and one or two photos:</strong> 20–40% saving.",
        "<strong>Marketing collateral with lots of imagery:</strong> 50–70% saving.",
        "<strong>Scanned document (every page is a photograph):</strong> 70–90% saving. This is where compression is most dramatic.",
        "<strong>Designer PDF exported at print quality:</strong> 50–80% saving on any preset below print quality.",
      ] },
      { type: "p", html: 'If your PDF is small and you&apos;re trying to make it smaller: probably not going to happen. If your PDF is large and mostly text: you&apos;ll get a modest saving. If it&apos;s large and image-heavy: expect to be pleasantly surprised. Drop it into <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a> and see.' },
      { type: "h2", id: "quality-loss", text: "Does compression lose quality?" },
      { type: "p", html: "Depends on which compression. Font subsetting and duplicate removal are lossless — the reader sees exactly the same output. Stream re-compression is lossless." },
      { type: "p", html: "Image downsampling and re-encoding are lossy. That's where the perceived &quot;quality loss&quot; comes from. On a document that will be viewed on a screen (not printed at large size), the loss is usually invisible — 150 DPI is more than a laptop displays, and JPEG at quality 80 is imperceptible on real-world photographs." },
      { type: "p", html: 'The exception is print. If your PDF is going to be printed at large sizes (posters, book pages, glossy brochures) you want higher-DPI images and the &quot;print&quot; preset — or you keep the file uncompressed. For web, email, and desk-scale printing, lossy is fine and the tradeoff is worth it.' },
      { type: "h2", id: "when-nothing-works", text: "When compression doesn't help" },
      { type: "p", html: "Occasionally you compress a 25 MB PDF, get back 24.9 MB, and think the tool is broken. Almost always one of:" },
      { type: "ul", items: [
        "<strong>Already compressed.</strong> A PDF from InDesign or a similar tool is likely already downsampled and subsetted. There&apos;s no fat left.",
        "<strong>Encrypted.</strong> The compressor can&apos;t re-encode content it can&apos;t read. Unlock via <a href=\"/tools/protect-pdf\" class=\"text-signal underline underline-offset-2\">Protect / Unlock PDF</a> first if you have the password, then compress, then re-protect.",
        "<strong>Weird stuff inside.</strong> Some PDFs embed video, 3D models, or huge JavaScript. Standard compressors don&apos;t touch those objects. Whatever is bloating the file isn&apos;t what compression targets.",
      ] },
      { type: "p", html: 'For scanned documents that stubbornly won&apos;t shrink, a nuclear option: <a href="/tools/pdf-to-jpg" class="text-signal underline underline-offset-2">extract each page as JPG</a>, <a href="/tools/compress-image" class="text-signal underline underline-offset-2">compress the images</a> aggressively, and rebuild the PDF via <a href="/tools/image-to-pdf" class="text-signal underline underline-offset-2">Image to PDF</a>. Slower but usually beats any generic compressor by a wide margin.' },
      { type: "h2", id: "summary", text: "The mental model" },
      { type: "p", html: 'Think of PDF compression as three separate levers: image quality (biggest lever, mostly lossy), font efficiency (medium lever, lossless), and stream packing (small lever, lossless). Most tools apply all three at once. Your file size after compression is a function of how much slack each lever had to pull.' },
      { type: "p", html: 'If you&apos;re trying to get to a specific size, adjust the preset. If you&apos;re past that and still oversized, the file has hit the floor of what compression can do — the rest of the file is signal, not noise.' },
    ],
    faqs: [
      { q: "Does PDF compression reduce quality?", a: "Lossless compression (font subsetting, stream repacking) doesn't affect quality. Lossy compression (image downsampling and re-encoding) reduces image quality — imperceptibly at balanced settings on screen, but visibly at aggressive settings or when printed at large sizes." },
      { q: "Why did my PDF not compress?", a: "Usually because it's already compressed — professionally-exported PDFs from InDesign or similar tools often have no fat left to trim. Encrypted PDFs also can't be compressed until unlocked. Text-only PDFs are naturally small and won't change much." },
      { q: "How small can I make a PDF?", a: "Image-heavy PDFs typically compress 50–90%. Text-heavy PDFs compress 0–20%. The floor is determined by the actual signal in the file — you can't compress below the amount of information the pages actually carry." },
      { q: "Is compressing a PDF safe?", a: "Yes, in the sense that the compressed PDF opens exactly like the original — same text, same layout, same page count. Only the image quality changes, and only imperceptibly at reasonable settings. Keep the original if you need the highest-quality version for print." },
    ],
    cta: { toolSlug: "compress-pdf", heading: "Try compressing your PDF", body: "Drop your PDF into Compress PDF and pick a preset. The tool tells you the before-and-after size before you commit to the download." },
    sources: [
      { label: "Adobe — Optimizing PDFs in Acrobat", href: "https://helpx.adobe.com/acrobat/using/optimizing-pdfs-acrobat-pro.html" },
      { label: "ISO 32000-2 — PDF 2.0 specification (Adobe copy)", href: "https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf" },
    ],
  },

  {
    slug: "qr-codes-vs-barcodes-when-to-use-which",
    title: "QR Codes vs Barcodes: What's Actually Different and When to Use Which",
    description: "The practical difference between QR codes and 1D barcodes — how much data each holds, where scanners find them, and which one you actually want for menus, inventory, event tickets, and packaging.",
    summary: "Barcodes (like CODE128 or EAN-13) are 1D — a short number, scanned at retail tills and warehouses. QR codes are 2D — hold much more data, encode URLs, scan with any phone camera. Use barcodes for inventory and retail, QR codes for anything a customer scans with a phone.",
    date: "2026-07-27",
    readMinutes: 6,
    tags: ["QR Code", "Barcode", "Business"],
    hero: { src: "/blog/blog-qr-vs-barcode-hero.jpg", alt: "A QR code and a 1D barcode pinned side-by-side to a workshop pegboard like product labels." },
    body: [
      { type: "p", html: "Two things get called &quot;barcodes&quot; casually and they aren't the same thing. The striped rectangle on a cereal box is a 1D barcode. The square with the pixellated pattern on a restaurant menu is a QR code. They both encode data as an image that a scanner can read, but they're built for genuinely different jobs." },
      { type: "p", html: "Here's the practical version, minus the technical rabbit hole." },
      { type: "h2", id: "1d-barcode", text: "1D barcodes: short numbers, industrial scanners" },
      { type: "p", html: "A traditional barcode encodes a short string — usually a number, sometimes letters. The bars are essentially a font that a laser scanner can read very quickly. There are several standards:" },
      { type: "ul", items: [
        "<strong>EAN-13:</strong> the 13-digit code on retail products worldwide. Every product SKU registered with GS1 gets an EAN.",
        "<strong>UPC-A:</strong> the 12-digit North American variant, essentially the same idea.",
        "<strong>CODE128:</strong> flexible — encodes letters, numbers, and symbols. Common in shipping labels and internal inventory.",
        "<strong>ITF-14:</strong> encodes the shipping-carton version of an EAN. Used on outer packaging.",
      ] },
      { type: "p", html: 'The key thing about 1D barcodes is that they encode <em>an identifier</em>, not <em>information</em>. A barcode says &quot;this is product 5901234123457.&quot; The scanner looks that number up in a database to find the actual price, description, stock level. Without the database, the barcode is meaningless.' },
      { type: "p", html: 'Generate any of these in your browser with <a href="/tools/barcode-generator" class="text-signal underline underline-offset-2">Barcode Generator</a> — pick your format, type the value, download as PNG or SVG.' },
      { type: "h2", id: "qr-code", text: "QR codes: hold real content, scanned by phones" },
      { type: "p", html: 'A QR code is a 2D matrix that holds up to several thousand characters — enough for a URL, a wifi password, contact info in vCard format, plain text, even a small payload of arbitrary data. Because the data is denser, QR codes are self-contained in a way 1D barcodes aren&apos;t: the QR code <em>is</em> the information, not a pointer to it.' },
      { type: "p", html: "That's why they took over consumer-facing use. A menu QR code contains the actual menu URL. A wifi QR code contains the SSID and password. An event ticket QR code contains a signed token the venue can verify offline. No middleman database required." },
      { type: "p", html: 'The other big difference: QR codes can be scanned by any phone camera. Every iPhone and Android device from 2018 onwards has QR code recognition built into the camera app. Point, wait a beat, tap the notification. That&apos;s the reason menus and posters use QR codes and not EAN — nobody has an EAN scanner in their pocket. Generate a QR code via <a href="/tools/qr-code-generator" class="text-signal underline underline-offset-2">QR Code Generator</a>.' },
      { type: "figure", src: "/blog/blog-qr-vs-barcode-hero.jpg", alt: "A QR code and a 1D barcode shown side by side.", caption: "Same purpose, different constraints. The stripes are for tills and warehouses; the square is for phones." },
      { type: "h2", id: "when-which", text: "Which one for which job" },
      { type: "h3", id: "retail", text: "Retail products" },
      { type: "p", html: 'EAN-13 or UPC-A. This is what point-of-sale scanners are calibrated for. The barcode ties to your inventory system, and every till in every shop already knows how to read it. You register the codes with <a href="https://www.gs1.org/" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">GS1</a>; the numbers aren&apos;t arbitrary.' },
      { type: "h3", id: "shipping", text: "Shipping and warehouse labels" },
      { type: "p", html: "CODE128 for flexibility (letters + numbers), ITF-14 for outer-carton shipping codes. Warehouse scanners can read both at speed from a moderate distance. Many logistics providers also add a QR code on the same label for phone-based scanning during last-mile delivery." },
      { type: "h3", id: "menus-marketing", text: "Menus, posters, flyers, business cards" },
      { type: "p", html: "QR code, essentially always. Encode the URL you want people to visit. Modern QR codes can be customised with a logo in the middle — the error correction lets the reader recover from a chunk of missing pixels — so they can look on-brand without breaking." },
      { type: "h3", id: "tickets", text: "Event tickets, boarding passes, e-tickets" },
      { type: "p", html: "QR code (or its cousin, the Aztec code, which some airlines prefer). The QR code holds a signed token the venue can verify offline — no lookup required. If you're issuing tickets, the QR code encodes a unique per-ticket string; the venue scans, verifies the signature, checks the ticket hasn't been used." },
      { type: "h3", id: "asset-tracking", text: "Internal asset tracking" },
      { type: "p", html: "Either works. QR codes are more forgiving because they can be scanned by any phone your team already has. CODE128 works if you have a fleet of scan guns already." },
      { type: "h3", id: "wifi", text: "Wifi passwords" },
      { type: "p", html: "QR code, using the WIFI: URL scheme. Print it, stick it on the router, and guests scan to connect without asking you to spell out a 20-character password. Modern phones recognize the format and offer to join the network automatically." },
      { type: "h2", id: "gotchas", text: "Practical gotchas" },
      { type: "h3", id: "size", text: "Print size matters" },
      { type: "p", html: "A QR code needs to be at least about 2 cm square at typical viewing distance for reliable scanning. On a business card, that means keeping the code big enough to be usable — a tiny QR code will fail from certain phones. For a menu on a wall, aim for 5 cm+ so people can scan from a nearby table." },
      { type: "p", html: "1D barcodes have their own minimums — usually 80% of nominal EAN size at the smallest. Print them too small and the scanner can't resolve the individual bars." },
      { type: "h3", id: "contrast", text: "Contrast" },
      { type: "p", html: "Black on white is the safe default. Some brand teams want colored QR codes; that works if the contrast is high enough. Beige on cream will fail. If you want to test, print a mockup and try scanning under normal indoor light." },
      { type: "h3", id: "error-correction", text: "Error correction (QR codes only)" },
      { type: "p", html: "QR codes have four error-correction levels (L, M, Q, H). Higher levels let the code recover from more damage but need more pixels. If you're going to add a logo in the middle, use Q or H. For a clean printed code, M is fine." },
      { type: "h2", id: "one-more", text: "One more thing about QR codes" },
      { type: "p", html: "Because a QR code can encode any URL, malicious QR codes are a real thing — someone stickers over a legitimate menu QR with one pointing at a phishing site. Not a reason to avoid QR codes; just a reason to look at the URL your phone shows you before tapping through. Same rule as any link, essentially." },
      { type: "p", html: "Generate honest ones for yourself, and check unfamiliar ones you scan. That's the whole trick." },
    ],
    faqs: [
      { q: "Can QR codes replace barcodes for retail products?", a: "In principle yes, but retail infrastructure is built around EAN and UPC barcodes. The till scanner, the inventory system, the supplier catalogues — all use the barcode number. Adding a QR code alongside is common; replacing the barcode isn't practical for retail products." },
      { q: "How much data can a QR code hold?", a: "Up to about 4,300 alphanumeric characters at the largest size and lowest error correction — enough for a long URL, wifi credentials, or a short document. In practice most QR codes hold a URL of 50–100 characters, which keeps the code small and easy to scan." },
      { q: "Do QR codes expire?", a: "The QR code image itself is just an encoded string — it doesn't expire. But if the URL it points to changes or is taken down, the QR code becomes dead. Dynamic QR codes (which use a redirect service) let you change the destination without reprinting; static QR codes encode the URL directly." },
      { q: "What barcode format should I use for internal inventory?", a: "CODE128 is the standard choice — it encodes letters, numbers, and symbols; scans reliably from most industrial scanners; and doesn't require GS1 registration. Reserve EAN/UPC for products you actually sell at retail." },
    ],
    cta: { toolSlug: "qr-code-generator", heading: "Generate a QR code or barcode", body: "Both tools run in your browser — pick your format, enter your value, download as PNG or SVG. No account, no watermark." },
    sources: [
      { label: "GS1 — About barcodes", href: "https://www.gs1.org/standards/barcodes" },
      { label: "ISO/IEC 18004 — QR Code standard summary", href: "https://www.iso.org/standard/62021.html" },
    ],
  },

  {
    slug: "browser-based-file-processing-is-it-safe",
    title: "The No-Signup Alternative to Adobe/Smallpdf/iLovePDF: Is Browser-Based File Processing Actually Safe?",
    description: "An honest look at browser-based file tools versus SaaS alternatives — how client-side processing actually works, the privacy implications, where it wins, and the small handful of cases where it doesn't.",
    summary: "Client-side file tools do all the processing inside your browser using JavaScript and WebAssembly — your files never leave your device. It's usually safer than uploading to a SaaS, and often as fast. The trade-off is initial load time (the tool code has to download once) and browser resource limits on very large files.",
    date: "2026-07-28",
    readMinutes: 8,
    tags: ["Privacy", "Browser", "Explainer"],
    hero: { src: "/blog/blog-browser-safe-hero.jpg", alt: "Illustration of a browser window on a workbench holding files safely inside, with a broken chain preventing them from leaking to a cloud icon." },
    body: [
      { type: "p", html: 'For years the model for online file tools was the same: upload your PDF to someone&apos;s server, wait for them to process it, download the result. Adobe does it, <a href="https://smallpdf.com/" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">Smallpdf</a> does it, <a href="https://www.ilovepdf.com/" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">iLovePDF</a> does it. They&apos;re real, established companies with real privacy policies. But they all share one thing: your file has to travel to their servers for anything to happen.' },
      { type: "p", html: "There's a different model now — the whole tool runs inside the browser tab, and the file never leaves your device. That's what EasyFileMagic does. It sounds like marketing copy, but it's a real architectural difference with real implications. Here's what's actually going on, and where the model wins or loses." },
      { type: "h2", id: "how-it-works", text: "How client-side file processing actually works" },
      { type: "p", html: 'Modern browsers ship with an astonishing amount of computational horsepower. <a href="https://developer.mozilla.org/en-US/docs/WebAssembly" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">WebAssembly</a> lets libraries written in C or Rust run at near-native speed inside the tab. The <a href="https://developer.mozilla.org/en-US/docs/Web/API/File_API" target="_blank" rel="noreferrer" class="text-signal underline underline-offset-2">File API</a> lets JavaScript read and write files locally without any network round-trip. Canvas, Web Workers, IndexedDB — a modern browser is essentially a mini operating system optimized for sandboxed code.' },
      { type: "p", html: "The tools that used to be desktop apps (Ghostscript, ffmpeg, Tesseract, pdf-lib) have all been compiled to WebAssembly. When you visit a tool page, the tool code downloads and runs locally. When you drop a file in, the file is read into memory in the tab. Processing happens right there. The output is written to your Downloads folder via a plain browser download. At no point does the file traverse the network." },
      { type: "p", html: "You can verify this yourself if you're technically inclined: open the browser's Network tab, drop a file into any tool, and watch. You'll see no upload requests during processing. The only network traffic is the initial tool page load and, occasionally, downloading a required WASM library (which is cached after first use)." },
      { type: "h2", id: "why-it-matters", text: "Why this matters for privacy" },
      { type: "p", html: "The uploading-to-a-server model has several inherent risks, regardless of how careful the operator is:" },
      { type: "ul", items: [
        "<strong>Server-side breach.</strong> If a company&apos;s servers are compromised, uploaded files can be exposed. This has happened to well-known cloud tools multiple times.",
        "<strong>Insider access.</strong> Server-side files are readable by employees with the right access; you&apos;re trusting the operator&apos;s controls.",
        "<strong>Retention.</strong> Even &quot;we delete after processing&quot; policies rely on the operator actually doing what they say. Backups, replicas, and logs can hold data longer than the policy states.",
        "<strong>Jurisdiction.</strong> The server might be in a country whose laws differ from yours. Some jurisdictions require operators to hand over data on request without notifying users.",
        "<strong>Silent policy changes.</strong> Terms of service and privacy policies change. You&apos;re bound by whatever is current when you upload, not what was current when you signed up.",
      ] },
      { type: "p", html: "None of these apply when the file never leaves your device. That's not a stronger version of trust in the operator — it's a different trust model entirely. You trust the browser (which you already trust for everything else) and you don't have to trust the tool operator at all for the file's confidentiality." },
      { type: "figure", src: "/blog/blog-browser-safe-hero.jpg", alt: "A browser window containing files safely, with a padlock preventing them from being uploaded to a cloud.", caption: "The file stays inside the tab. That's the whole architecture." },
      { type: "h2", id: "compared-honestly", text: "Compared honestly to the alternatives" },
      { type: "p", html: "This isn't a hit piece on Adobe or Smallpdf or iLovePDF. They're competent products with real features. What follows is where each model does and doesn't win." },
      { type: "h3", id: "browser-wins", text: "Where browser-based wins" },
      { type: "ul", items: [
        "<strong>Privacy.</strong> No upload = no server-side risk. This matters for contracts, financials, health records, anything with someone else&apos;s name on it.",
        "<strong>Speed for small files.</strong> No round trip, no queue, no rate limit. A 2 MB PDF compresses instantly.",
        "<strong>No signup.</strong> No account, no email, no re-marketing sequence, no forgotten password. Open the tab, do the thing, close the tab.",
        "<strong>Offline capable.</strong> After first load, the tool works with no network. Useful on planes, in secure environments, or when the office wifi is flaky.",
        "<strong>No subscription creep.</strong> Free means free. There&apos;s no page limit that suddenly requires an upgrade.",
      ] },
      { type: "h3", id: "saas-wins", text: "Where SaaS still wins" },
      { type: "ul", items: [
        "<strong>Very large files.</strong> A 500 MB video hits browser memory limits before it hits server limits. Server-side tools can handle files that would OOM a tab.",
        "<strong>Team workflows.</strong> Shared folders, permissions, comments, sign-off flows — server-side tools have infrastructure for teams that browser tools don&apos;t.",
        "<strong>Certificate-based e-signatures.</strong> Legally-binding signatures with audit trails and timestamps come from products like DocuSign; a browser drawing tool produces a valid simple signature but not a qualified one.",
        "<strong>Cloud integration.</strong> Direct read/write to Google Drive, Dropbox, OneDrive. A browser tool can accept files from your device but doesn&apos;t plug into cloud storage the same way.",
        "<strong>Long-running jobs.</strong> A three-hour video transcode should run on a server, not in a tab you have to keep open.",
      ] },
      { type: "h2", id: "limits", text: "The honest limits of browser processing" },
      { type: "p", html: "Not every job fits. The main constraints:" },
      { type: "p", html: "<strong>Memory.</strong> A browser tab typically has 2–4 GB of usable memory before things get slow. Processing a 300 MB PDF or a 2-hour 4K video can bump against that. Server-side has effectively unlimited RAM." },
      { type: "p", html: "<strong>CPU on old devices.</strong> A high-end laptop crunches through OCR or video transcoding fast. An older phone or a Chromebook takes longer. Server-side gives everyone the same CPU no matter what device they're on." },
      { type: "p", html: '<strong>First-load download.</strong> Some tools need a library or model file that&apos;s 20–50 MB. That&apos;s a one-time download but a real cost on a metered connection.' },
      { type: "p", html: "<strong>Browser support.</strong> Very old browsers (pre-2020) don't support the WebAssembly features these tools rely on. This is basically not a problem anymore, but worth mentioning." },
      { type: "h2", id: "why-easyfilemagic", text: "Why we built it this way" },
      { type: "p", html: 'The simple version: uploading a bank statement to compress it feels wrong. So does uploading a signed contract, or a passport photo, or an internal report. But that&apos;s the model most PDF tools defaulted to, because in 2010 that was the only way. In 2026 it isn&apos;t.' },
      { type: "p", html: 'Every tool on <a href="/" class="text-signal underline underline-offset-2">EasyFileMagic</a> — <a href="/tools/compress-pdf" class="text-signal underline underline-offset-2">Compress PDF</a>, <a href="/tools/pdf-word" class="text-signal underline underline-offset-2">PDF ↔ Word</a>, <a href="/tools/sign-pdf" class="text-signal underline underline-offset-2">Sign PDF</a>, <a href="/tools/remove-background" class="text-signal underline underline-offset-2">Remove Background</a>, all of them — runs entirely client-side. Your files stay on your device. That&apos;s not a feature to shout about; it&apos;s just the default we picked because it&apos;s the correct one for the vast majority of jobs.' },
      { type: "p", html: "The one honest caveat: we can't process files bigger than your browser's memory allows. For a 2 GB video, use a server-side tool. For a 200 MB PDF, we'll probably struggle. For everything below that — which is 95% of everyday jobs — client-side is faster, more private, and doesn't require an account." },
      { type: "h2", id: "how-to-check", text: "How to verify any tool is client-side" },
      { type: "p", html: "If a tool claims to be client-side, you can check:" },
      { type: "ol", items: [
        "Open the browser Developer Tools (F12 in most browsers).",
        "Go to the Network tab.",
        "Drop your file into the tool and process it.",
        "Watch the request list. If files are being uploaded, you&apos;ll see a POST request with the file size — usually to an upload endpoint. If it&apos;s truly client-side, no such request appears during processing.",
      ] },
      { type: "p", html: "Analytics requests and small telemetry pings are normal and don't contain your file. What you're looking for is the absence of large uploads. It's a five-second check and the honest tools all pass." },
    ],
    faqs: [
      { q: "Are browser-based file tools really as safe as they claim?", a: "If a tool genuinely processes files client-side, it's safer than uploading to any server — the file never leaves your device, so there's nothing to breach, retain, or subpoena. Verify by watching your browser's Network tab: no upload requests during processing means client-side." },
      { q: "What's the catch with free browser-based tools?", a: "The main trade-offs are browser memory limits (large files may not fit) and initial load times (the tool code has to download once). No signup, no watermark, no page limits is the actual model, not a bait-and-switch." },
      { q: "How does EasyFileMagic compare to Adobe Acrobat or Smallpdf?", a: "Adobe and Smallpdf run server-side — files upload for processing. EasyFileMagic runs entirely in the browser. For privacy and speed on typical files, browser-based wins. For very large files, team workflows, or certificate-based signatures, server-side products offer features the browser can't match." },
      { q: "Can I use browser-based tools offline?", a: "Yes, after the initial page load. The tool code and any required libraries cache in the browser, so subsequent visits work with no network. Useful on planes or in secure environments." },
    ],
    cta: { toolSlug: "compress-pdf", heading: "See client-side processing for yourself", body: "Open any tool, drop a file in, and watch your Network tab. Nothing uploads. Compress PDF is a good place to start." },
    sources: [
      { label: "MDN — WebAssembly", href: "https://developer.mozilla.org/en-US/docs/WebAssembly" },
      { label: "MDN — File API", href: "https://developer.mozilla.org/en-US/docs/Web/API/File_API" },
    ],
  },
  // ============================================================
  // FRENCH ARTICLES
  // ============================================================
  {
    slug: "comment-convertir-pdf-word-gratuit",
    title: "Comment convertir un PDF en Word gratuitement (sans inscription)",
    description:
      "Guide pratique pour convertir un PDF en document Word éditable, directement dans votre navigateur. Sans logiciel, sans compte, sans envoi de fichier sur un serveur.",
    summary:
      "Ouvrez le PDF dans l'outil Convertir PDF en Word, cliquez sur Convertir, et téléchargez un fichier .docx éditable — le tout dans votre navigateur, sans compte.",
    date: "2026-07-20",
    readMinutes: 6,
    tags: ["PDF", "Word", "Comment faire"],
    lang: "fr",
    translations: [
      { lang: "de", slug: "pdf-in-word-umwandeln-kostenlos" },
      { lang: "ar", slug: "tahwil-pdf-ila-word" },
    ],
    hero: { src: "/blog/blog-conversion-tools-hero.jpg", alt: "Illustration d'un PDF transformé en document Word éditable sur un atelier." },
    body: [
      { type: "p", html: "Vous avez reçu un devis, un contrat ou un rapport en PDF, et vous devez en modifier le texte. Le format PDF a été conçu pour empêcher exactement cela — figer une mise en page. Heureusement, en 2026, vous pouvez convertir un PDF en Word (.docx) éditable en quelques secondes, dans votre navigateur, sans installer de logiciel." },
      { type: "p", html: "Ce guide explique comment procéder avec l'outil <a href=\"/tools/pdf-word\" class=\"text-signal underline underline-offset-2\">Convertir PDF en Word</a>, ce qui est préservé (et ce qui ne l'est pas), et quand utiliser plutôt l'OCR." },
      { type: "h2", id: "etapes", text: "Étapes en trois clics" },
      { type: "ol", items: [
        "Ouvrez <a href=\"/tools/pdf-word\" class=\"text-signal underline underline-offset-2\">Convertir PDF en Word</a> dans votre navigateur.",
        "Glissez-déposez votre PDF dans la zone en pointillé, ou cliquez pour choisir un fichier.",
        "Cliquez sur <em>Convertir</em>, puis téléchargez le fichier .docx généré. Ouvrez-le dans Word, LibreOffice ou Google Docs.",
      ] },
      { type: "p", html: "L'ensemble du traitement se fait dans l'onglet de votre navigateur. Aucun fichier n'est envoyé sur nos serveurs — vous pouvez vérifier vous-même dans l'onglet <em>Réseau</em> des outils développeur." },
      { type: "h2", id: "ce-qui-est-preserve", text: "Ce qui est préservé (et ce qui ne l'est pas)" },
      { type: "p", html: "Un PDF peut contenir deux types de contenu très différents, et cela change tout :" },
      { type: "ul", items: [
        "<strong>PDF avec texte réel</strong> (exporté depuis Word, InDesign, Google Docs…). Le texte, les paragraphes, les titres et les listes sont convertis fidèlement. La mise en page complexe (colonnes, encadrés flottants) peut se réajuster — c'est normal pour toute conversion PDF vers Word.",
        "<strong>PDF scanné</strong> (image d'une page papier). Il n'y a pas de texte à extraire, seulement des pixels. Passez d'abord le fichier par <a href=\"/tools/ocr\" class=\"text-signal underline underline-offset-2\">OCR</a> pour transformer l'image en texte réel, puis convertissez.",
      ] },
      { type: "h2", id: "pourquoi-navigateur", text: "Pourquoi choisir un outil en ligne côté navigateur" },
      { type: "p", html: "Les convertisseurs classiques envoient votre PDF sur un serveur, le traitent, puis vous renvoient le résultat. Ce n'est pas un problème pour une brochure marketing publique. Mais pour un contrat, une fiche de paie, un devis client ou un dossier médical, vous confiez le document à un tiers." },
      { type: "p", html: "Un outil <em>client-side</em> comme celui-ci fait tout dans votre onglet grâce à <a href=\"https://developer.mozilla.org/fr/docs/WebAssembly\" target=\"_blank\" rel=\"noreferrer\" class=\"text-signal underline underline-offset-2\">WebAssembly</a>. Rien ne quitte votre appareil. Fermez l'onglet et le fichier disparaît de notre côté (parce qu'il n'y a jamais été)." },
      { type: "h2", id: "erreurs-frequentes", text: "Trois erreurs à éviter" },
      { type: "ol", items: [
        "<strong>Confondre PDF scanné et PDF texte.</strong> Si vous ne pouvez pas sélectionner le texte avec votre souris dans le PDF, c'est un scan. Utilisez d'abord l'OCR.",
        "<strong>Attendre un rendu 100% identique.</strong> Word et PDF sont deux formats différents. Une mise en page graphique complexe se réajustera — visez la modifiabilité, pas la reproduction pixel-parfaite.",
        "<strong>Utiliser un service qui garde vos fichiers.</strong> Vérifiez toujours la politique de rétention. Un outil qui ne téléverse rien est par définition le plus sûr.",
      ] },
    ],
    faqs: [
      { q: "Est-ce vraiment gratuit et sans inscription ?", a: "Oui. L'outil est 100% gratuit, sans compte, sans limite quotidienne et sans filigrane. Le modèle est de vous donner l'outil, pas de capturer votre email." },
      { q: "Mon PDF reste-t-il privé ?", a: "Oui. La conversion se déroule entièrement dans votre navigateur avec WebAssembly. Aucun fichier n'est téléversé — vous pouvez le vérifier dans l'onglet Réseau des outils développeur." },
      { q: "Puis-je convertir un PDF scanné ?", a: "Pas directement, car un scan est une image, pas du texte. Passez d'abord le PDF par l'outil OCR pour extraire le texte, puis convertissez-le en Word." },
    ],
    cta: { toolSlug: "pdf-word", heading: "Convertir votre PDF en Word maintenant", body: "Ouvrez l'outil, glissez votre PDF, et téléchargez le .docx en quelques secondes. Rien n'est envoyé sur nos serveurs." },
    sources: [
      { label: "MDN — WebAssembly", href: "https://developer.mozilla.org/fr/docs/WebAssembly" },
      { label: "Adobe — À propos du format PDF", href: "https://www.adobe.com/fr/acrobat/about-adobe-pdf.html" },
    ],
  },

  {
    slug: "compresser-pdf-sans-perte-qualite",
    title: "Comment compresser un PDF sans perte de qualité visible",
    description:
      "Réduisez la taille d'un PDF pour l'email et l'upload sans dégrader la lisibilité. Guide pratique et étapes exactes dans votre navigateur.",
    summary:
      "Choisissez le préréglage Équilibré dans Compresser PDF pour diviser la taille par 5 à 10 sans différence visible à l'écran ; passez à Minimal si vous êtes contre une limite stricte.",
    date: "2026-07-21",
    readMinutes: 6,
    tags: ["PDF", "Compression", "Comment faire"],
    lang: "fr",
    translations: [
      { lang: "en", slug: "how-to-compress-a-pdf-without-losing-quality" },
      { lang: "ar", slug: "kayfa-daghat-pdf-majanan" },
    ],
    hero: { src: "/blog/blog-compress-pdf-hero.jpg", alt: "Un PDF volumineux passé dans une machine d'atelier qui produit un PDF plus mince." },
    body: [
      { type: "p", html: "Votre PDF fait 42 Mo, le formulaire n'accepte que 10 Mo, et la deadline est dans dix minutes. C'est la situation la plus fréquente en 2026, et elle se règle en moins d'une minute — sans Acrobat Pro, sans installer, sans créer un compte." },
      { type: "p", html: "Voici pourquoi les PDF grossissent, comment choisir entre compression avec ou sans perte, et comment le faire dans votre navigateur avec <a href=\"/tools/compress-pdf\" class=\"text-signal underline underline-offset-2\">Compresser PDF</a>." },
      { type: "h2", id: "pourquoi", text: "Pourquoi un PDF devient-il énorme ?" },
      { type: "p", html: "Dans 90% des cas, la réponse est : <strong>les images</strong>. Un scan couleur à 600 DPI d'un contrat de 5 pages pèse déjà 40 Mo. Un rapport avec des captures d'écran haute résolution monte vite à 20 Mo. Le texte, lui, ne pèse quasiment rien." },
      { type: "h2", id: "avec-ou-sans-perte", text: "Avec ou sans perte : lequel choisir ?" },
      { type: "p", html: "La compression <strong>sans perte</strong> réorganise le fichier sans rien supprimer — gains modestes, généralement 10 à 30%. La compression <strong>avec perte</strong> ré-encode les images à une résolution plus adaptée à l'écran (150 DPI, JPEG qualité 0.7) — gains massifs, souvent 80 à 95%." },
      { type: "p", html: "Règle simple : utilisez la compression avec perte pour tout ce que vous allez envoyer par email, uploader ou imprimer en A4. Réservez la compression sans perte aux documents juridiques que vous voulez conserver au pixel près." },
      { type: "h2", id: "etapes", text: "Étapes exactes" },
      { type: "ol", items: [
        "Ouvrez <a href=\"/tools/compress-pdf\" class=\"text-signal underline underline-offset-2\">Compresser PDF</a>.",
        "Déposez votre PDF dans la zone en pointillé.",
        "Sélectionnez le préréglage <em>Équilibré</em> par défaut ; passez à <em>Minimal</em> si vous devez absolument respecter une limite stricte.",
        "Cliquez sur <em>Compresser</em>. Une barre de progression affiche l'avancement.",
        "Téléchargez le PDF compressé. Comparez-le à l'original — le texte est identique et les images restent lisibles.",
      ] },
      { type: "h2", id: "trop-gros", text: "Le fichier reste trop gros ?" },
      { type: "ul", items: [
        "Si le PDF est déjà optimisé (exporté depuis InDesign avec compression d'images activée), il ne compressera presque plus. C'est normal.",
        "Si le PDF est protégé par mot de passe, déprotégez-le d'abord avec <a href=\"/tools/protect-pdf\" class=\"text-signal underline underline-offset-2\">Protéger / Déverrouiller PDF</a>.",
        "Si votre PDF est essentiellement un dossier photos, extrayez les images avec <a href=\"/tools/pdf-to-jpg\" class=\"text-signal underline underline-offset-2\">PDF en JPG</a>, compressez-les avec <a href=\"/tools/compress-image\" class=\"text-signal underline underline-offset-2\">Compresser image</a>, puis reconstituez le PDF avec <a href=\"/tools/image-to-pdf\" class=\"text-signal underline underline-offset-2\">Images en PDF</a>.",
      ] },
      { type: "h2", id: "confidentialite", text: "Vos fichiers restent chez vous" },
      { type: "p", html: "Tous les outils cités fonctionnent entièrement dans le navigateur. Aucun envoi vers nos serveurs. C'est essentiel pour les contrats, bulletins de salaire, dossiers médicaux et tout document confidentiel." },
    ],
    faqs: [
      { q: "Quelle est la perte de qualité réelle ?", a: "En préréglage Équilibré, la différence est invisible à l'écran et en impression bureautique. En préréglage Minimal, les scans deviennent légèrement plus doux mais restent parfaitement lisibles." },
      { q: "Combien de fois puis-je utiliser l'outil ?", a: "Autant que vous voulez. Aucune limite quotidienne, aucun filigrane ajouté, aucun compte requis." },
      { q: "Ça marche sur mobile ?", a: "Oui, sur Safari (iOS) et Chrome (Android), pour des fichiers jusqu'à environ 100 Mo selon la mémoire disponible de votre téléphone." },
    ],
    cta: { toolSlug: "compress-pdf", heading: "Réduire la taille de votre PDF maintenant", body: "Ouvrez Compresser PDF, choisissez un préréglage et téléchargez le fichier allégé. Rien n'est envoyé sur nos serveurs." },
    sources: [
      { label: "MDN — WebAssembly", href: "https://developer.mozilla.org/fr/docs/WebAssembly" },
      { label: "Adobe — Optimisation des PDF", href: "https://helpx.adobe.com/fr/acrobat/using/optimizing-pdfs-acrobat-pro.html" },
    ],
  },

  // ============================================================
  // GERMAN ARTICLES
  // ============================================================
  {
    slug: "bilder-ohne-qualitaetsverlust-komprimieren",
    title: "Wie man Bilder ohne Qualitätsverlust komprimiert (kostenlos, im Browser)",
    description:
      "Praktischer Leitfaden zum Verkleinern von JPG- und PNG-Dateien ohne sichtbaren Qualitätsverlust — direkt im Browser, ohne Anmeldung.",
    summary:
      "Öffnen Sie Bild komprimieren, wählen Sie die Qualitätsstufe 80% für JPG oder verlustfrei für PNG — die meisten Fotos werden auf 20-40% ihrer Ausgangsgröße reduziert.",
    date: "2026-07-20",
    readMinutes: 6,
    tags: ["Bild", "Kompression", "Anleitung"],
    lang: "de",
    hero: { src: "/blog/blog-jpg-png-webp-hero.jpg", alt: "Ein großes Bild wird in einer Werkstatt-Maschine zu einer kleineren Datei komprimiert." },
    body: [
      { type: "p", html: "Handykameras liefern heute 12- bis 48-Megapixel-Fotos. Ein einziges Bild wiegt schnell 5–8 MB. Für Web, E-Mail oder Social Media ist das zehnmal zu viel — und Ihre Besucher, Empfänger und der Algorithmus danken es Ihnen nicht." },
      { type: "p", html: "Dieser Leitfaden erklärt, wie Bildkompression tatsächlich funktioniert, wann Sie welchen Modus wählen sollten und wie Sie es mit <a href=\"/tools/compress-image\" class=\"text-signal underline underline-offset-2\">Bild komprimieren</a> direkt im Browser erledigen." },
      { type: "h2", id: "warum", text: "Warum überhaupt komprimieren?" },
      { type: "ul", items: [
        "<strong>Ladezeit.</strong> Google straft langsame Seiten ab. Ein 5-MB-Foto vs. 500-KB-Foto ist der Unterschied zwischen 3 Sekunden und 0,3 Sekunden Ladezeit auf mobiler Verbindung.",
        "<strong>E-Mail-Limits.</strong> Gmail lehnt Anhänge über 25 MB ab. Fünf unkomprimierte Fotos sind bereits jenseits davon.",
        "<strong>Speicher.</strong> Wer täglich 20 Fotos verschickt, verschwendet Cloudspeicher — und Datenvolumen beim Empfänger.",
      ] },
      { type: "h2", id: "verlustfrei-vs-verlustbehaftet", text: "Verlustfrei vs. verlustbehaftet: was heißt das wirklich?" },
      { type: "p", html: "<strong>Verlustfrei</strong> bedeutet, dass jedes Pixel exakt erhalten bleibt. Nur die interne Speicherung wird optimiert. Typische Ersparnis: 10–30%. Das ist die richtige Wahl für Logos, Screenshots von Text und alles, wo Sie später noch bearbeiten wollen — PNG-Format." },
      { type: "p", html: "<strong>Verlustbehaftet</strong> nutzt aus, dass das menschliche Auge feine Farbunterschiede kaum wahrnimmt. JPEG mit Qualität 80% liefert Fotos, die praktisch nicht vom Original zu unterscheiden sind — bei 80% weniger Dateigröße. Für Urlaubsfotos, Produktbilder und alles Fotografische ist das der Goldstandard." },
      { type: "h2", id: "schritt-fur-schritt", text: "Schritt für Schritt" },
      { type: "ol", items: [
        "Öffnen Sie <a href=\"/tools/compress-image\" class=\"text-signal underline underline-offset-2\">Bild komprimieren</a> im Browser.",
        "Ziehen Sie ein oder mehrere Bilder in die gestrichelte Fläche.",
        "Wählen Sie Qualität <em>80%</em> für Fotos (bester Kompromiss). Für Screenshots und Logos: PNG verlustfrei belassen.",
        "Klicken Sie auf <em>Komprimieren</em>. Bei mehreren Bildern erhalten Sie eine ZIP-Datei.",
        "Laden Sie das Ergebnis herunter und öffnen Sie es zum Vergleich mit dem Original. Der Unterschied ist praktisch unsichtbar.",
      ] },
      { type: "p", html: "Für Massen-Optimierung eines ganzen Fotoordners ist <a href=\"/tools/bulk-image-compress\" class=\"text-signal underline underline-offset-2\">Bulk-Bildkompression</a> die schnellere Wahl — bis zu 100 Bilder gleichzeitig, als eine ZIP." },
      { type: "h2", id: "webp", text: "WebP: der Modernitäts-Trick" },
      { type: "p", html: "WebP wurde von Google entwickelt und liefert bei gleicher Bildqualität rund 30% kleinere Dateien als JPEG. Jeder moderne Browser unterstützt es. Wenn Sie Bilder für Ihre eigene Website hochladen, konvertieren Sie zuerst nach WebP mit <a href=\"/tools/image-converter\" class=\"text-signal underline underline-offset-2\">Bildkonverter</a>." },
      { type: "h2", id: "datenschutz", text: "Ihre Bilder bleiben bei Ihnen" },
      { type: "p", html: "Der gesamte Kompressionsvorgang läuft im Browser-Tab, dank <a href=\"https://developer.mozilla.org/de/docs/Web/API/Canvas_API\" target=\"_blank\" rel=\"noreferrer\" class=\"text-signal underline underline-offset-2\">Canvas API</a> und WebAssembly. Kein Upload, kein Konto, keine Registrierung. Familien-Fotos und Firmen-Screenshots bleiben auf Ihrem Gerät." },
    ],
    faqs: [
      { q: "Kann ich mehrere Bilder gleichzeitig komprimieren?", a: "Ja. Ziehen Sie einfach mehrere Dateien in die Dropzone — Sie erhalten eine ZIP-Datei mit allen komprimierten Bildern." },
      { q: "Welche Qualitätsstufe ist die richtige?", a: "Für Fotos: 80% ist der Standard-Kompromiss. Für Web-Bilder unter 200 KB: 65-70%. Für Druck: 90-95% verwenden." },
      { q: "Funktioniert das auch für PNG?", a: "Ja, aber PNG wird verlustfrei komprimiert (typisch 10-30% kleiner). Für Fotos ist JPG immer die deutlich kleinere Wahl." },
    ],
    cta: { toolSlug: "compress-image", heading: "Bilder jetzt komprimieren", body: "Öffnen Sie Bild komprimieren, wählen Sie eine Qualitätsstufe und laden Sie die verkleinerten Fotos herunter. Alles im Browser, kein Upload." },
    sources: [
      { label: "MDN — Canvas API", href: "https://developer.mozilla.org/de/docs/Web/API/Canvas_API" },
      { label: "Google — WebP", href: "https://developers.google.com/speed/webp" },
    ],
  },

  {
    slug: "pdf-in-word-umwandeln-kostenlos",
    title: "PDF in Word umwandeln — kostenlos, online, ohne Installation",
    description:
      "Anleitung: PDF-Dateien in bearbeitbare Word-Dokumente (.docx) umwandeln, direkt im Browser. Kein Konto, keine E-Mail-Adresse, keine Wasserzeichen.",
    summary:
      "Ziehen Sie das PDF in den Konverter, klicken Sie auf Umwandeln, und laden Sie eine bearbeitbare .docx-Datei herunter — alles läuft in Ihrem Browser.",
    date: "2026-07-21",
    readMinutes: 5,
    tags: ["PDF", "Word", "Anleitung"],
    lang: "de",
    translations: [
      { lang: "fr", slug: "comment-convertir-pdf-word-gratuit" },
      { lang: "ar", slug: "tahwil-pdf-ila-word" },
    ],
    hero: { src: "/blog/blog-conversion-tools-hero.jpg", alt: "Ein PDF wird in ein bearbeitbares Word-Dokument umgewandelt." },
    body: [
      { type: "p", html: "PDF wurde erfunden, damit ein Dokument auf jedem Gerät gleich aussieht. Der Preis: es ist nicht ohne Weiteres editierbar. Wenn Sie einen Vertrag anpassen, ein Angebot umschreiben oder Text aus einem Bericht wiederverwenden müssen, brauchen Sie eine Word-Version." },
      { type: "p", html: "Mit <a href=\"/tools/pdf-word\" class=\"text-signal underline underline-offset-2\">PDF in Word umwandeln</a> geht das in Sekunden — im Browser, ohne Software zu installieren und ohne Konto anzulegen." },
      { type: "h2", id: "so-gehts", text: "In drei Schritten" },
      { type: "ol", items: [
        "Öffnen Sie <a href=\"/tools/pdf-word\" class=\"text-signal underline underline-offset-2\">PDF in Word umwandeln</a>.",
        "Ziehen Sie Ihre PDF-Datei in die Dropzone oder wählen Sie sie über den Datei-Dialog aus.",
        "Klicken Sie auf <em>Umwandeln</em> und laden Sie die entstandene .docx-Datei herunter.",
      ] },
      { type: "p", html: "Öffnen Sie das Ergebnis in Microsoft Word, LibreOffice oder Google Docs. Text, Absätze, Überschriften und Listen werden übernommen." },
      { type: "h2", id: "was-funktioniert", text: "Was funktioniert — und was nicht" },
      { type: "p", html: "Ein PDF kann zwei sehr unterschiedliche Inhalte haben, und das entscheidet über den weiteren Weg:" },
      { type: "ul", items: [
        "<strong>Text-PDFs</strong> (aus Word, InDesign, Google Docs exportiert) werden zuverlässig konvertiert. Komplexe Layouts mit Spalten und schwebenden Bildern werden neu umbrochen — das ist bei jeder PDF→Word-Konvertierung normal.",
        "<strong>Gescannte PDFs</strong> sind Bilder von Papierseiten. Sie enthalten keinen Text zum Extrahieren. Führen Sie das PDF zuerst durch <a href=\"/tools/ocr\" class=\"text-signal underline underline-offset-2\">OCR</a>, um Text zu erzeugen, und konvertieren Sie danach.",
      ] },
      { type: "h2", id: "datenschutz", text: "Warum Browser-basiert wichtig ist" },
      { type: "p", html: "Klassische Online-Konverter laden Ihre Datei auf einen Server. Für einen öffentlichen Prospekt kein Thema. Für einen Arbeitsvertrag, eine Gehaltsabrechnung oder Kunden-Angebote ist das ein DSGVO-Alarm." },
      { type: "p", html: "Diese Umwandlung läuft komplett in Ihrem Browser-Tab dank <a href=\"https://developer.mozilla.org/de/docs/WebAssembly\" target=\"_blank\" rel=\"noreferrer\" class=\"text-signal underline underline-offset-2\">WebAssembly</a>. Kein Upload, keine Server-Speicherung, keine Retention-Policy zu prüfen. Schließen Sie den Tab und die Datei ist weg." },
      { type: "h2", id: "haeufige-fehler", text: "Drei häufige Fehler" },
      { type: "ol", items: [
        "<strong>Ein Scan wird wie ein Text-PDF behandelt.</strong> Prüfen Sie: können Sie im PDF Text mit der Maus markieren? Wenn nein, ist es ein Scan. Erst OCR, dann konvertieren.",
        "<strong>Pixelgenaue Reproduktion erwarten.</strong> Word und PDF sind unterschiedliche Formate. Das Ziel ist Bearbeitbarkeit, nicht identische Optik.",
        "<strong>Ein Dienst wird benutzt, der Dateien speichert.</strong> Prüfen Sie immer die Datenschutzerklärung. Ein Tool, das nichts hochlädt, ist per Definition am sichersten.",
      ] },
    ],
    faqs: [
      { q: "Bleibt die Formatierung erhalten?", a: "Für Text, Absätze, Überschriften und Listen: ja. Für komplexe Layouts mit Spalten oder schwebenden Elementen kann Word neu umbrechen — das ist bei jeder PDF-zu-Word-Konvertierung normal." },
      { q: "Ist es wirklich DSGVO-konform?", a: "Ja, weil kein personenbezogenes Datum unser System erreicht. Die Datei verlässt Ihr Gerät nicht — überprüfbar im Netzwerk-Tab des Browsers." },
      { q: "Wie groß darf die Datei sein?", a: "Praktisches Limit liegt bei etwa 100 MB, abhängig vom Arbeitsspeicher Ihres Geräts. Große PDFs sollten Sie zuerst mit Kompression verkleinern." },
    ],
    cta: { toolSlug: "pdf-word", heading: "Jetzt PDF in Word umwandeln", body: "Öffnen Sie den Konverter, ziehen Sie die PDF-Datei hinein und laden Sie das .docx herunter. Alles im Browser, ohne Konto." },
    sources: [
      { label: "MDN — WebAssembly", href: "https://developer.mozilla.org/de/docs/WebAssembly" },
      { label: "Adobe — Über PDF", href: "https://www.adobe.com/de/acrobat/about-adobe-pdf.html" },
    ],
  },

  {
    slug: "heic-in-jpg-umwandeln-iphone",
    title: "HEIC in JPG umwandeln — iPhone-Fotos richtig speichern und teilen",
    description:
      "Wie Sie HEIC-Fotos vom iPhone in universell lesbare JPG- oder PNG-Bilder umwandeln, direkt im Browser. Kein Upload, kein Konto.",
    summary:
      "Ziehen Sie HEIC-Dateien in den HEIC-zu-JPG-Konverter und laden Sie die JPG-Version herunter — kein iPhone, kein macOS und kein Upload nötig.",
    date: "2026-07-22",
    readMinutes: 5,
    tags: ["Bild", "iPhone", "Konvertierung"],
    lang: "de",
    hero: { src: "/blog/blog-heic-hero.jpg", alt: "Ein iPhone-Foto im HEIC-Format wird zu einem JPG umgewandelt." },
    body: [
      { type: "p", html: "Sie schicken ein Foto vom iPhone an einen Windows-Kollegen oder laden es in ein Job-Portal hoch — und plötzlich: „Dateityp nicht unterstützt.\" Das Foto ist im HEIC-Format, Apples Standardformat seit iOS 11. Es ist effizient (halb so groß wie JPG bei gleicher Qualität), aber außerhalb der Apple-Welt oft nicht lesbar." },
      { type: "p", html: "Die Lösung: HEIC in JPG umwandeln. Mit <a href=\"/tools/heic-to-jpg\" class=\"text-signal underline underline-offset-2\">HEIC in JPG</a> geht das ohne iPhone, ohne macOS und ohne Foto-Upload — direkt in Ihrem Browser." },
      { type: "h2", id: "warum-heic", text: "Warum verwendet Apple HEIC?" },
      { type: "p", html: "HEIC (High Efficiency Image Container) speichert Fotos in besserer Qualität bei kleinerer Dateigröße. Für die iPhone-Bibliothek ist das ein klarer Gewinn. Das Problem entsteht nur beim Teilen: Windows 10, ältere Android-Versionen, viele Web-Uploader und Content-Management-Systeme kennen das Format nicht." },
      { type: "h2", id: "schritte", text: "So konvertieren Sie in vier Klicks" },
      { type: "ol", items: [
        "Öffnen Sie <a href=\"/tools/heic-to-jpg\" class=\"text-signal underline underline-offset-2\">HEIC in JPG</a> in einem beliebigen Browser (auch auf Windows, Android, Linux).",
        "Ziehen Sie ein oder mehrere .heic-Dateien in die Dropzone.",
        "Wählen Sie das Zielformat (JPG oder PNG) und optional die Qualität.",
        "Klicken Sie auf <em>Konvertieren</em> und laden Sie die JPG-Datei herunter. Bei mehreren Fotos erhalten Sie eine ZIP.",
      ] },
      { type: "h2", id: "iphone-einstellungen", text: "Alternativ: iPhone auf JPG umstellen" },
      { type: "p", html: "Wenn Sie langfristig HEIC vermeiden wollen, ändern Sie die iPhone-Einstellung: <em>Einstellungen → Kamera → Formate → Maximale Kompatibilität</em>. Neue Fotos werden dann als JPG gespeichert. Bestehende HEIC-Fotos bleiben allerdings HEIC — die konvertieren Sie am schnellsten mit dem Browser-Tool." },
      { type: "h2", id: "datenschutz", text: "Ihre Fotos bleiben privat" },
      { type: "p", html: "Familien-, Kinder- und Urlaubsfotos gehören nicht auf einen fremden Server. Der Konverter läuft komplett in Ihrem Browser mit <a href=\"https://developer.mozilla.org/de/docs/WebAssembly\" target=\"_blank\" rel=\"noreferrer\" class=\"text-signal underline underline-offset-2\">WebAssembly</a>. Kein Upload, keine Cloud-Speicherung, keine Weitergabe." },
      { type: "h2", id: "batch", text: "Ganzer Foto-Ordner auf einmal" },
      { type: "p", html: "Sie können bis zu 50 HEIC-Bilder gleichzeitig konvertieren. Für noch größere Serien nutzen Sie danach <a href=\"/tools/bulk-image-compress\" class=\"text-signal underline underline-offset-2\">Bulk-Bildkompression</a>, um die JPGs auch gleich für Web und E-Mail zu verkleinern." },
    ],
    faqs: [
      { q: "Verliere ich Qualität beim Umwandeln?", a: "Bei JPG-Qualität 90-95% ist der Unterschied praktisch unsichtbar. Bei niedrigerer Qualität sparen Sie mehr Speicher, aber die Datei ist weiter komprimiert. 90% ist ein guter Standard." },
      { q: "Bleiben die EXIF-Daten (Aufnahmezeit, Ort) erhalten?", a: "Standardmäßig ja. Falls Sie sie vor dem Teilen entfernen möchten, nutzen Sie danach den EXIF-Entferner-Tool." },
      { q: "Was ist mit Live Photos?", a: "Der Standbildteil des Live Photos wird konvertiert. Die Bewegungssequenz (Video-Teil) geht dabei verloren — das ist bei jeder HEIC-zu-JPG-Konvertierung so, weil JPG kein Video enthalten kann." },
    ],
    cta: { toolSlug: "heic-to-jpg", heading: "HEIC jetzt in JPG umwandeln", body: "Öffnen Sie den Konverter, ziehen Sie Ihre iPhone-Fotos hinein und laden Sie die JPG-Versionen herunter. Alles läuft in Ihrem Browser." },
    sources: [
      { label: "Apple — HEIF und HEVC", href: "https://support.apple.com/de-de/HT207022" },
      { label: "MDN — WebAssembly", href: "https://developer.mozilla.org/de/docs/WebAssembly" },
    ],
  },

  // ============================================================
  // ARABIC ARTICLES (RTL)
  // ============================================================
  {
    slug: "kayfa-daghat-pdf-majanan",
    title: "كيفية ضغط ملفات PDF مجانًا بدون فقدان الجودة",
    description:
      "دليل عملي لتصغير حجم ملفات PDF لإرسالها عبر البريد الإلكتروني وواتساب، بدون فقدان جودة القراءة. يعمل بالكامل داخل المتصفح، بدون تسجيل.",
    summary:
      "افتح أداة ضغط PDF، اختر مستوى الجودة \"متوازن\"، وستحصل على ملف أصغر بنسبة 80-90% دون فرق ملحوظ في القراءة — كل شيء داخل متصفحك.",
    date: "2026-07-20",
    readMinutes: 6,
    tags: ["PDF", "ضغط", "شرح"],
    lang: "ar",
    translations: [
      { lang: "en", slug: "how-to-compress-a-pdf-without-losing-quality" },
      { lang: "fr", slug: "compresser-pdf-sans-perte-qualite" },
    ],
    hero: { src: "/blog/blog-compress-pdf-hero.jpg", alt: "ملف PDF كبير يتم ضغطه عبر أداة ورشة عمل ليصبح ملفًا أصغر." },
    body: [
      { type: "p", html: "المشكلة الأكثر شيوعًا مع ملفات PDF: حجمها الكبير. عقد من 5 صفحات ممسوح بدقة عالية قد يصل إلى 40 ميغابايت، بينما نموذج التقديم يقبل 5 ميغابايت فقط. الخبر السار: يمكن حل هذا في أقل من دقيقة، دون تثبيت أي برنامج ودون إرسال الملف لأي خادم." },
      { type: "p", html: "هذا الدليل يشرح سبب انتفاخ ملفات PDF، الفرق بين الضغط مع فقدان وبدون فقدان الجودة، وكيفية القيام بذلك مجانًا داخل متصفحك باستخدام <a href=\"/tools/compress-pdf\" class=\"text-signal underline underline-offset-2\">أداة ضغط PDF</a>." },
      { type: "h2", id: "sabab", text: "لماذا يكبر حجم ملف PDF؟" },
      { type: "p", html: "في 90% من الحالات، الإجابة هي: <strong>الصور</strong>. مسح ضوئي ملون بدقة 600 نقطة لكل بوصة لعقد من 5 صفحات يصل إلى 40 ميغابايت بسهولة. تقرير يحتوي على لقطات شاشة عالية الدقة قد يتجاوز 20 ميغابايت. النصوص وحدها لا تشكل شيئًا يذكر من الحجم." },
      { type: "h2", id: "anwaa", text: "ضغط مع فقدان أم بدون فقدان الجودة؟" },
      { type: "p", html: "<strong>الضغط بدون فقدان الجودة</strong> يعيد ترتيب طريقة تخزين الملف دون حذف أي بكسل — المكاسب متواضعة عادة 10 إلى 30%. <strong>الضغط مع فقدان</strong> يُعيد ترميز الصور بدقة أنسب للشاشة (150 DPI بجودة JPEG 70%) — مكاسب هائلة، تصل إلى 80-95%." },
      { type: "p", html: "القاعدة البسيطة: استخدم الضغط مع الفقدان لأي ملف ستُرسله بالبريد أو ترفعه أو تطبعه على ورق A4. احتفظ بالضغط بدون فقدان للمستندات القانونية التي تريد الاحتفاظ بها بكل تفاصيلها." },
      { type: "h2", id: "khatwat", text: "الخطوات بالتفصيل" },
      { type: "ol", items: [
        "افتح <a href=\"/tools/compress-pdf\" class=\"text-signal underline underline-offset-2\">أداة ضغط PDF</a> في متصفحك.",
        "اسحب ملف PDF إلى المنطقة المُحدّدة بالخطوط المتقطعة، أو انقر لاختيار ملف من جهازك.",
        "اختر الإعداد الافتراضي <em>متوازن</em>، أو <em>الحد الأدنى</em> إذا كنت مضطرًا لتجاوز حد صارم للحجم.",
        "اضغط زر <em>ضغط PDF</em>. شريط التقدم سيُظهر لك ما تقوم به الأداة.",
        "حمّل الملف المضغوط. قارنه بالأصلي — النص متطابق، والصور لا تزال واضحة تمامًا.",
      ] },
      { type: "h2", id: "yastamer", text: "الملف لا يزال كبيرًا؟" },
      { type: "ul", items: [
        "إذا كان PDF محسّنًا مسبقًا (مُصدَّر من InDesign بتفعيل ضغط الصور)، فلن ينخفض حجمه كثيرًا. هذا طبيعي.",
        "إذا كان PDF محميًا بكلمة مرور، أزل الحماية أولاً باستخدام <a href=\"/tools/protect-pdf\" class=\"text-signal underline underline-offset-2\">حماية / إزالة حماية PDF</a> ثم اضغطه.",
        "إذا كان PDF عبارة عن مجلد صور مغلّف: استخرج الصور بـ <a href=\"/tools/pdf-to-jpg\" class=\"text-signal underline underline-offset-2\">PDF إلى JPG</a>، اضغطها بـ <a href=\"/tools/compress-image\" class=\"text-signal underline underline-offset-2\">ضغط الصور</a>، ثم أعد بناء PDF بـ <a href=\"/tools/image-to-pdf\" class=\"text-signal underline underline-offset-2\">صور إلى PDF</a>.",
      ] },
      { type: "h2", id: "khsosyah", text: "ملفاتك تبقى على جهازك" },
      { type: "p", html: "جميع الأدوات المذكورة تعمل بالكامل داخل متصفحك عبر <a href=\"https://developer.mozilla.org/en-US/docs/WebAssembly\" target=\"_blank\" rel=\"noreferrer\" class=\"text-signal underline underline-offset-2\">WebAssembly</a>. لا يُرفع أي ملف لأي خادم — يمكنك التحقق من ذلك بنفسك في تبويب <em>الشبكة</em> بأدوات المطوّر. مهم جدًا للعقود والفواتير والسجلات الطبية وأي مستند سري." },
    ],
    faqs: [
      { q: "هل الأداة مجانية فعلاً وبدون تسجيل؟", a: "نعم، 100% مجانية، بدون حساب، بدون حد يومي، وبدون علامة مائية على الملف الناتج." },
      { q: "ما هو فقدان الجودة الفعلي؟", a: "في وضع \"متوازن\"، الفرق غير مرئي على الشاشة وعند الطباعة المكتبية. في وضع \"الحد الأدنى\"، تصبح المسحوبات الضوئية أنعم قليلاً لكنها تبقى واضحة تمامًا." },
      { q: "هل تعمل على الهاتف؟", a: "نعم، على Safari (آيفون) وChrome (أندرويد)، لملفات تصل حتى 100 ميغابايت تقريبًا حسب ذاكرة الجهاز المتاحة." },
    ],
    cta: { toolSlug: "compress-pdf", heading: "اضغط ملف PDF الآن", body: "افتح أداة ضغط PDF، اختر إعدادًا، ثم حمّل الملف المضغوط. لا شيء يُرفع لخوادمنا." },
    sources: [
      { label: "MDN — WebAssembly", href: "https://developer.mozilla.org/en-US/docs/WebAssembly" },
      { label: "Adobe — تحسين ملفات PDF", href: "https://helpx.adobe.com/acrobat/using/optimizing-pdfs-acrobat-pro.html" },
    ],
  },

  {
    slug: "tahwil-pdf-ila-word",
    title: "تحويل PDF إلى Word مجانًا (بدون تثبيت أي برنامج)",
    description:
      "دليل عملي لتحويل ملف PDF إلى Word (.docx) قابل للتحرير، مباشرة من متصفحك. بدون حساب، بدون رفع، وبدون علامة مائية.",
    summary:
      "افتح أداة تحويل PDF إلى Word، اسحب ملفك، وحمّل ملف .docx قابلاً للتحرير في Word أو Google Docs — كل شيء يحدث داخل متصفحك.",
    date: "2026-07-21",
    readMinutes: 5,
    tags: ["PDF", "Word", "شرح"],
    lang: "ar",
    translations: [
      { lang: "fr", slug: "comment-convertir-pdf-word-gratuit" },
      { lang: "de", slug: "pdf-in-word-umwandeln-kostenlos" },
    ],
    hero: { src: "/blog/blog-conversion-tools-hero.jpg", alt: "ملف PDF يتحوّل إلى مستند Word قابل للتحرير." },
    body: [
      { type: "p", html: "صيغة PDF صُممت أساسًا لتثبيت المظهر عبر كل الأجهزة. الثمن: لا يمكن تعديلها بسهولة. لكن كثيرًا ما تصلنا عقود أو عروض أسعار أو تقارير كملف PDF ونحتاج لتعديل نصها. في هذه الحالة، الحل هو التحويل إلى Word." },
      { type: "p", html: "أداة <a href=\"/tools/pdf-word\" class=\"text-signal underline underline-offset-2\">تحويل PDF إلى Word</a> تقوم بذلك في ثوانٍ، داخل متصفحك، بدون تثبيت برامج وبدون إنشاء حساب." },
      { type: "h2", id: "khatwat", text: "الخطوات في ثلاث نقرات" },
      { type: "ol", items: [
        "افتح <a href=\"/tools/pdf-word\" class=\"text-signal underline underline-offset-2\">أداة تحويل PDF إلى Word</a>.",
        "اسحب ملف PDF إلى منطقة الرفع، أو اختره من جهازك.",
        "اضغط <em>تحويل</em>، ثم حمّل ملف .docx وافتحه في Microsoft Word أو LibreOffice أو Google Docs.",
      ] },
      { type: "h2", id: "maypreserve", text: "ما يتم الحفاظ عليه — وما لا يتم" },
      { type: "p", html: "ملف PDF قد يحتوي نوعين مختلفين تمامًا من المحتوى، والفرق مهم جدًا:" },
      { type: "ul", items: [
        "<strong>PDF نصي</strong> (مُصدَّر من Word أو InDesign أو Google Docs). النصوص والفقرات والعناوين والقوائم تُنقل بأمانة. التصميمات المعقدة (أعمدة، صناديق عائمة) قد يعاد ترتيبها — هذا طبيعي في أي تحويل من PDF إلى Word.",
        "<strong>PDF ممسوح ضوئيًا</strong> عبارة عن صور لصفحات ورقية. لا يوجد نص لاستخراجه. مرِّر الملف أولاً عبر <a href=\"/tools/ocr\" class=\"text-signal underline underline-offset-2\">أداة OCR</a> لاستخراج النص، ثم حوّل الناتج إلى Word.",
      ] },
      { type: "h2", id: "khsosyah", text: "لماذا الأدوات داخل المتصفح أفضل" },
      { type: "p", html: "أدوات التحويل التقليدية ترفع ملفك على خادم، تعالجه، ثم ترسل لك النتيجة. لا مشكلة في نشرة تسويقية عامة. لكن في عقد عمل، أو كشف راتب، أو عرض سعر لعميل، أنت تُسلِّم المستند لطرف ثالث." },
      { type: "p", html: "الأداة هنا تعمل بالكامل داخل تبويب متصفحك عبر <a href=\"https://developer.mozilla.org/en-US/docs/WebAssembly\" target=\"_blank\" rel=\"noreferrer\" class=\"text-signal underline underline-offset-2\">WebAssembly</a>. لا شيء يغادر جهازك. أغلق التبويب ويختفي الملف من عندنا (لأنه لم يصل أصلاً)." },
      { type: "h2", id: "akhtaa", text: "ثلاثة أخطاء شائعة" },
      { type: "ol", items: [
        "<strong>معاملة الملف الممسوح كملف نصي.</strong> اختبار سريع: هل يمكنك تحديد النص بالفأرة داخل PDF؟ إذا لا، فهو ممسوح ضوئيًا. استخدم OCR أولاً.",
        "<strong>توقّع نسخة طبق الأصل بصريًا.</strong> Word وPDF صيغتان مختلفتان. الهدف هو التعديل، لا استنساخ الشكل بكسلاً بكسل.",
        "<strong>استخدام خدمة تحتفظ بملفاتك.</strong> راجع سياسة الاحتفاظ دائمًا. الأداة التي لا ترفع أي شيء هي الأكثر أمانًا بالتعريف.",
      ] },
    ],
    faqs: [
      { q: "هل هي مجانية فعلاً؟", a: "نعم. الأداة مجانية 100%، بدون حساب، وبدون حد يومي، وبدون علامة مائية على الملف الناتج." },
      { q: "هل يبقى ملفي خاصًا؟", a: "نعم. التحويل يتم بالكامل داخل متصفحك. لا يُرفع الملف لأي خادم — يمكنك التحقق بنفسك من تبويب الشبكة في أدوات المطوّر." },
      { q: "هل يعمل مع PDF بالعربية؟", a: "نعم. النصوص العربية تُحفظ في ملف .docx بالاتجاه الصحيح (من اليمين إلى اليسار) وتعمل بشكل طبيعي في Word وGoogle Docs." },
    ],
    cta: { toolSlug: "pdf-word", heading: "حوّل PDF إلى Word الآن", body: "افتح الأداة، اسحب ملفك، وحمّل ملف .docx القابل للتحرير. كل شيء داخل متصفحك، بدون حساب." },
    sources: [
      { label: "MDN — WebAssembly", href: "https://developer.mozilla.org/en-US/docs/WebAssembly" },
      { label: "Adobe — نبذة عن PDF", href: "https://www.adobe.com/acrobat/about-adobe-pdf.html" },
    ],
  },

  {
    slug: "how-to-remove-background-from-image-free",
    title: "How to Remove Background from an Image for Free (2026 Guide)",
    description:
      "Cut the background out of any photo for free in 2026 — a step-by-step browser workflow, transparent PNG export tips, and how the free tiers compare.",
    summary:
      "Open the free background remover, drop in a JPG or PNG, let the segmentation model separate the subject, and download a transparent PNG. It runs in your browser, so there is no upload, no watermark and no export limit.",
    date: "2026-08-06",
    readMinutes: 8,
    tags: ["Image", "AI", "How-to"],
    hero: {
      src: "/blog/blog-remove-bg-hero.jpg",
      alt: "Illustration of a photo subject being lifted away from its background, leaving a transparent checkerboard behind.",
    },
    body: [
      { type: "p", html: 'Removing a background used to mean an hour with the pen tool. In 2026 a segmentation model does the same job in a few seconds, and the good news is you do not have to pay for it or hand your photo to a server. This guide covers what background removal is actually used for, how to do it free in your browser, and how the free tiers of the popular alternatives compare.' },
      { type: "h2", id: "what-for", text: "What background removal is actually used for" },
      { type: "ul", items: [
        "<strong>E-commerce listings.</strong> Amazon, Shopify, eBay and Daraz all expect product shots on a pure white or transparent background. A consistent cut-out is usually the difference between a listing that looks professional and one that looks improvised.",
        "<strong>Social and profile images.</strong> Cut-out subjects sit cleanly on brand colours, thumbnails and story templates without a distracting kitchen or office behind them.",
        "<strong>Design and print work.</strong> Transparent PNGs drop straight into posters, slide decks, mockups and packaging artwork without a white box around them.",
        "<strong>Documents and ID photos.</strong> Passport and visa photos usually require a plain light background — replacing a busy one is often the fastest route to an accepted photo.",
      ] },
      { type: "h2", id: "step-by-step", text: "Step by step: remove a background for free" },
      { type: "p", html: 'The <a href="/tools/remove-background" class="text-signal underline underline-offset-2">AI Background Remover</a> runs the whole job inside your browser tab. Your photo is never uploaded, which matters if the image is a client product shot or a photo of a person.' },
      { type: "ol", items: [
        'Open the <a href="/tools/remove-background" class="text-signal underline underline-offset-2">Background Remover</a>. Nothing to install and no account to create.',
        "Drop in a JPG, PNG or WebP. The first run downloads the open-source segmentation model once; after that it is cached and works even offline.",
        "Wait a few seconds while the model separates subject from background. Larger images take longer because there are more pixels to classify.",
        "Check the edges — hair, fur and thin straps are where every model struggles. If the cut looks rough, retry with a sharper, better-lit version of the same photo.",
        "Download the transparent PNG. Choose PNG rather than JPG: JPG has no alpha channel, so a transparent background would be flattened to white.",
      ] },
      { type: "h2", id: "better-results", text: "Getting a clean cut on the first try" },
      { type: "ul", items: [
        "<strong>Contrast beats resolution.</strong> A subject that stands out tonally from its background segments far better than a dark jacket against a dark wall.",
        "<strong>Even, diffuse light.</strong> Hard shadows behind the subject are frequently read as part of the subject.",
        "<strong>Shoot slightly wider.</strong> Cropping tight to the subject removes the context the model uses to find its outline.",
        "<strong>Avoid heavy JPEG compression.</strong> Blocky artefacts around edges become ragged edges in the mask.",
        '<strong>Need a white background rather than transparency?</strong> Export the transparent PNG, then place it on white with the <a href="/tools/product-bg-remover" class="text-signal underline underline-offset-2">Product Photo Background Remover</a>, which exports marketplace-ready white-background files directly.',
      ] },
      { type: "h2", id: "comparison", text: "How the free options compare" },
      { type: "p", html: "All of the tools below do a competent job on a typical photo — the practical differences are in what the free tier lets you keep, and whether the image leaves your device. Free tiers change often, so check the current terms before you commit to a workflow." },
      { type: "ul", items: [
        "<strong>EasyFileMagic Background Remover.</strong> Free with no account. Processing happens locally in your browser, so images are not uploaded. Full-resolution transparent PNG download, no watermark and no per-day cap; the limit is your device's memory.",
        "<strong>remove.bg.</strong> Widely used and very strong on hair and fine edges. The free tier lets you preview at full size but downloads are limited to a small preview resolution, with full-resolution files available through paid credits or a subscription. Images are processed on their servers.",
        "<strong>Canva Background Remover.</strong> Excellent if you are already designing in Canva, because the cut-out stays inside your design. Background removal is a Canva Pro feature rather than part of the free plan, and files are processed and stored in the cloud.",
      ] },
      { type: "p", html: "In short: for occasional cut-outs inside an existing design workflow, the integrated tools are convenient. For high-resolution exports at no cost, or for images you would rather not upload anywhere, a browser-based remover is the pragmatic choice." },
      { type: "h2", id: "after", text: "What to do with the cut-out next" },
      { type: "p", html: 'A transparent PNG is usually a step, not the destination. Resize it for a specific marketplace with <a href="/tools/image-resize" class="text-signal underline underline-offset-2">Image Resize</a>, shrink the file for a fast-loading listing with <a href="/tools/compress-image" class="text-signal underline underline-offset-2">Compress Image</a>, or convert it to WebP with the <a href="/tools/image-converter" class="text-signal underline underline-offset-2">Image Converter</a> once transparency is baked in.' },
    ],
    faqs: [
      { q: "Is removing an image background really free?", a: "Yes. The EasyFileMagic background remover is free with no account, no watermark and no daily export limit. It runs in your browser, so there is no server cost to pass on to you." },
      { q: "Do my photos get uploaded to a server?", a: "No. The segmentation model is downloaded to your browser the first time you use the tool, and every image after that is processed locally in your tab. You can confirm it yourself in your browser's network panel." },
      { q: "What file format should I download?", a: "PNG. It supports an alpha channel, so the transparent background is preserved. JPG has no transparency and will flatten the cut-out onto a solid white background." },
      { q: "Why are the edges around hair rough?", a: "Fine strands are the hardest case for any automatic tool, paid or free. A sharper, well-lit photo with good contrast between hair and background produces a noticeably cleaner mask than a dim or heavily compressed one." },
    ],
    cta: { toolSlug: "remove-background", heading: "Remove a background now — free", body: "Drop in a photo and download a transparent PNG in seconds. No signup, no watermark, and the image never leaves your browser." },
    sources: [
      { label: "MDN — Canvas API and image data", href: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API" },
      { label: "W3C — PNG specification (alpha channel)", href: "https://www.w3.org/TR/png/" },
    ],
  },

  {
    slug: "how-to-use-claude-ai-pro-free",
    title: "How to Use Claude AI Pro Features for Free (2026)",
    description:
      "What Claude Pro actually adds, the legitimate ways to get more AI capability at no cost in 2026, and free browser tools that cover common paid-AI tasks.",
    summary:
      "There is no legitimate way to unlock Claude Pro without paying, but you can get a long way free: the free tier covers everyday chat, trials and education or nonprofit programmes occasionally extend access, and free local AI tools handle many of the file tasks people buy a subscription for.",
    date: "2026-08-06",
    readMinutes: 7,
    tags: ["AI", "Guide"],
    hero: {
      src: "/blog/blog-claude-free-hero.jpg",
      alt: "Illustration of an AI assistant interface with message bubbles and a usage meter showing free-tier limits.",
    },
    body: [
      { type: "p", html: 'Search for "Claude Pro for free" and you will find a lot of pages promising hacks. Almost all of them are either out of date, against the provider\'s terms, or outright scams that want your login. This article takes the honest route: what a Pro-level subscription actually buys you, which legitimate paths give you more capability at no cost, and which jobs you can stop paying for entirely because a free browser tool does them.' },
      { type: "h2", id: "what-pro-is", text: "What Pro-level use actually looks like" },
      { type: "p", html: "Paid tiers of consumer AI assistants generally differ from free tiers in a few predictable ways rather than in raw intelligence:" },
      { type: "ul", items: [
        "<strong>Higher usage limits.</strong> The free tier resets a message allowance on a rolling window; the paid tier raises it substantially. This is the difference most people actually feel.",
        "<strong>Priority access at peak times.</strong> Free users get throttled first when demand spikes.",
        "<strong>Earlier access to the newest models and features.</strong> New capabilities typically land on paid plans first and reach the free tier later.",
        "<strong>Larger or longer-running workflows.</strong> Bigger attachments, longer projects, and higher-throughput tooling.",
      ] },
      { type: "p", html: "Note what is <em>not</em> on that list: the free tier is not a crippled model. For drafting, summarising, explaining code and everyday questions, most people bump into usage limits long before they bump into a quality ceiling." },
      { type: "h2", id: "legit-free", text: "Legitimate ways to get more, for free" },
      { type: "ol", items: [
        "<strong>Use the free tier deliberately.</strong> Limits reset on a rolling window, so batching your hardest questions and keeping throwaway chats short stretches an allowance a long way. Start a fresh conversation for a new topic — long threads consume more context on every turn.",
        "<strong>Take an official trial when one is offered.</strong> Providers periodically run free trials of paid plans, and cloud partners sometimes include credits. Only use offers published by the provider or an official partner.",
        "<strong>Check education and nonprofit programmes.</strong> Discounted or sponsored access for students, researchers and registered nonprofits comes and goes; eligibility and availability vary by provider and country, so check the provider's own pricing and education pages rather than a third-party list.",
        "<strong>Use the free tiers of more than one assistant.</strong> Running two or three free assistants side by side is entirely legitimate and effectively multiplies your daily allowance.",
        "<strong>Move file work off the assistant entirely.</strong> A large share of what people burn paid messages on — converting, summarising, transcribing, cleaning up images — is handled better and instantly by a purpose-built tool.",
      ] },
      { type: "p", html: "What we deliberately do not cover: shared accounts, leaked API keys, \"unlimited\" reseller sites and prompt tricks claiming to unlock paid models. They violate provider terms, they routinely stop working, and the ones asking for your credentials are phishing." },
      { type: "h2", id: "free-substitutes", text: "Free tools that replace paid AI for file work" },
      { type: "p", html: "EasyFileMagic runs open-source AI models directly in your browser. There is no account, no message quota and no upload, because the model runs on your device rather than someone's server. Three that cover the most common paid-AI requests:" },
      { type: "ul", items: [
        '<strong><a href="/tools/ai-summarizer" class="text-signal underline underline-offset-2">AI Summarizer</a>.</strong> Paste a long document or article and get a condensed summary locally. This is the single most common reason people hit a chat usage limit.',
        '<strong><a href="/tools/remove-background" class="text-signal underline underline-offset-2">AI Background Remover</a> and the <a href="/tools/ai-image-caption" class="text-signal underline underline-offset-2">AI Image Caption</a> tool.</strong> Cut subjects out of photos and generate alt-text style descriptions — the image editing and captioning jobs usually reserved for paid tiers.',
        '<strong><a href="/tools/ai-transcribe" class="text-signal underline underline-offset-2">AI Transcribe</a>.</strong> Turn audio or video into text with a local Whisper-family model, then paste only the section you care about into your assistant instead of the whole recording.',
      ] },
      { type: "p", html: 'The practical pattern: use free local tools for the mechanical work — extracting, converting, transcribing, cutting out — and save your limited assistant messages for the reasoning and writing that genuinely need a large language model. Related tools worth knowing: <a href="/tools/ai-upscale" class="text-signal underline underline-offset-2">AI Upscale</a> and <a href="/tools/ocr" class="text-signal underline underline-offset-2">OCR</a>.' },
      { type: "h2", id: "when-to-pay", text: "When paying is simply the right call" },
      { type: "p", html: "If you use an assistant for hours every working day, a subscription usually costs less than the time lost to hitting limits mid-task. Free tiers and free local tools are excellent for occasional and moderate use; they are not a substitute for a professional workflow that depends on continuous access." },
    ],
    faqs: [
      { q: "Is there a legitimate way to get Claude Pro for free?", a: "Not permanently. The genuinely legitimate paths are the provider's own free tier, official trials or promotional credits, and any education or nonprofit programme the provider currently runs. Shared accounts, resold logins and 'unlock' tricks break the terms of service and often stop working within days." },
      { q: "Is the free tier good enough for everyday use?", a: "For most people, yes. The free tier is not a weaker model — the main difference is how many messages you can send in a rolling window and how quickly you are throttled at peak times." },
      { q: "Are EasyFileMagic's AI tools really free with no limits?", a: "Yes. The AI tools download an open-source model to your browser on first use and then run locally, so there is no per-message quota, no account and no upload. The only practical limit is your device's memory and speed." },
      { q: "Do the AI tools send my files anywhere?", a: "No. After the one-time model download, summarising, transcription, captioning and background removal all happen inside your browser tab. Your documents, images and recordings stay on your device." },
    ],
    cta: { toolSlug: "ai-summarizer", heading: "Try the free AI tools", body: "Summarise, transcribe, caption and edit with open-source models running in your own browser — no account and no message limit." },
    sources: [
      { label: "Anthropic — Claude pricing and plans", href: "https://www.anthropic.com/pricing" },
      { label: "Anthropic — Usage policy", href: "https://www.anthropic.com/legal/aup" },
    ],
  },

  {
    slug: "passport-size-photo-complete-guide-2025",
    title: "Passport Size Photo: Complete Guide (2026)",
    description:
      "Passport photo sizes for the US, UK, Schengen and Pakistan, plus background and attire rules, the most common rejection reasons, and how to make one free.",
    summary:
      "A US passport photo is 2×2 inches with the head 1–1⅜ inches tall; the UK and Schengen standard is 35×45 mm; Pakistan uses 35×45 mm for passports and 2×2 inches for NADRA CNIC. All four require a plain light background, a neutral expression and no glasses.",
    date: "2026-08-06",
    readMinutes: 9,
    tags: ["Image", "Guide", "How-to"],
    hero: {
      src: "/blog/blog-passport-photo-hero.jpg",
      alt: "Illustration of a passport booklet beside a sheet of ID photo prints with crop guides and millimetre rulers.",
    },
    body: [
      { type: "p", html: 'Passport photo rules look fussy until you realise what they are for: the photo has to work for a human at a border desk and for face-matching software. That is why the head size, the background and the expression are all specified so precisely. Get those three right and almost everything else follows. Always confirm the current requirements on the issuing authority\'s own page before you submit — specifications are updated from time to time.' },
      { type: "h2", id: "sizes", text: "Sizes country by country" },
      { type: "h3", id: "us", text: "United States" },
      { type: "ul", items: [
        "<strong>Print size:</strong> 2 × 2 inches (51 × 51 mm), square.",
        "<strong>Head height:</strong> 1 to 1⅜ inches (25–35 mm) from the bottom of the chin to the top of the head.",
        "<strong>Eye position:</strong> roughly 1⅛ to 1⅜ inches (28–35 mm) from the bottom of the photo.",
        "<strong>Background:</strong> plain white or off-white.",
        "<strong>Colour, recency:</strong> colour photo taken within the last six months.",
      ] },
      { type: "h3", id: "uk", text: "United Kingdom" },
      { type: "ul", items: [
        "<strong>Print size:</strong> 35 × 45 mm (portrait).",
        "<strong>Head height:</strong> 29–34 mm from chin to crown.",
        "<strong>Background:</strong> plain cream or light grey — not pure white, and no pattern or shadow.",
        "<strong>Digital submissions:</strong> the online application accepts a digital photo with its own minimum pixel dimensions and file size, so keep the original camera file rather than a messaging-app copy.",
      ] },
      { type: "h3", id: "schengen", text: "Schengen / EU" },
      { type: "ul", items: [
        "<strong>Print size:</strong> 35 × 45 mm, the ICAO-aligned standard used across Schengen states.",
        "<strong>Head height:</strong> typically 32–36 mm, so the face fills roughly 70–80% of the frame — noticeably tighter than a US photo.",
        "<strong>Background:</strong> plain light grey or off-white, evenly lit with no shadow behind the head.",
        "<strong>National variations:</strong> individual countries publish their own photo templates; check the consulate you are applying to.",
      ] },
      { type: "h3", id: "pakistan", text: "Pakistan (passport and NADRA CNIC)" },
      { type: "ul", items: [
        "<strong>Passport:</strong> 35 × 45 mm with a plain white background, head centred and fully visible.",
        "<strong>NADRA CNIC / NICOP:</strong> commonly 2 × 2 inches (51 × 51 mm) with a plain white background.",
        "<strong>Head covering:</strong> religious head coverings are permitted provided the full face from chin to forehead is clearly visible.",
      ] },
      { type: "h2", id: "background-attire", text: "Background, attire and expression rules" },
      { type: "ul", items: [
        "<strong>Background:</strong> plain and light, with no pattern, furniture, doorframe or shadow. Photograph yourself at least half a metre in front of the wall so your own shadow does not fall on it.",
        "<strong>Expression:</strong> neutral, mouth closed, both eyes open and looking straight at the camera. No smiling in most jurisdictions.",
        "<strong>Glasses:</strong> the US, UK and most Schengen states no longer allow glasses in passport photos. Take them off.",
        "<strong>Head coverings:</strong> permitted for religious or medical reasons, provided the face is unobscured from the bottom of the chin to the top of the forehead.",
        "<strong>Clothing:</strong> ordinary day clothes, not a uniform. Avoid white or very pale tops, which merge into a light background.",
        "<strong>Lighting:</strong> even, front-facing, ideally daylight from a window. No flash directly at the face, no hard side shadow.",
        "<strong>Babies and children:</strong> no dummy or toy in frame, eyes open where possible, and no other person's hands visible — lay an infant on a plain white sheet and shoot from directly above.",
      ] },
      { type: "h2", id: "rejections", text: "The most common rejection reasons" },
      { type: "ol", items: [
        "<strong>Head too large or too small in the frame.</strong> By far the most frequent failure — a photo cropped by eye almost never lands inside the specified head-height band.",
        "<strong>Shadow behind the head</strong> or uneven background lighting.",
        "<strong>A smile, or eyes not looking at the lens.</strong>",
        "<strong>Glasses, reflections or eyes partially covered by a fringe.</strong>",
        "<strong>Low resolution or a compressed messaging-app copy.</strong> Send yourself the original file, not a WhatsApp forward.",
        "<strong>A photo that is too old.</strong> Most authorities require one taken within the last six months.",
        "<strong>Digital retouching.</strong> Removing blemishes, smoothing skin or applying a filter can invalidate the photo for face matching.",
      ] },
      { type: "h2", id: "make-one", text: "Step by step: make a compliant photo for free" },
      { type: "p", html: 'The <a href="/tools/photo-id-maker" class="text-signal underline underline-offset-2">Passport Photo Maker</a> does the crop maths for you and runs entirely in your browser, so a photo of your face is never uploaded anywhere.' },
      { type: "ol", items: [
        "Take the source photo: phone on a stand or held by someone else, at eye level, roughly one metre away, facing a window with a plain light wall behind you. Do not use a selfie held at arm's length — it distorts the face.",
        'Open the <a href="/tools/photo-id-maker" class="text-signal underline underline-offset-2">Passport Photo Maker</a> and drop the image in.',
        "Choose your target: US 2×2, UK/Schengen 35×45 mm, Pakistani passport or NADRA CNIC. The tool applies that country's head-height and crop ratio.",
        "Align the guides to your chin and the top of your head so the head-height band is respected.",
        'If your background is not plain enough, run the photo through the <a href="/tools/remove-background" class="text-signal underline underline-offset-2">Background Remover</a> first and place the cut-out on a plain white or light grey backdrop.',
        "Export as JPG or PNG. For a digital application, check the required pixel dimensions and file size; for printing, download the print sheet and take it to any photo lab.",
      ] },
      { type: "p", html: 'If the finished file is larger than an application form allows, <a href="/tools/compress-image" class="text-signal underline underline-offset-2">Compress Image</a> reduces it to a target size in KB without changing the pixel dimensions — the usual fix for "file too large" upload errors.' },
    ],
    faqs: [
      { q: "What is the standard passport photo size?", a: "There is no single global size. The United States uses 2 × 2 inches (51 × 51 mm); the UK, the Schengen states and most ICAO-aligned countries use 35 × 45 mm. Pakistan uses 35 × 45 mm for passports and commonly 2 × 2 inches for NADRA CNIC photos." },
      { q: "Can I take a passport photo at home with my phone?", a: "Yes, and most authorities accept it as long as the photo meets the specification. Use a plain light wall, even daylight, a neutral expression, and have someone else hold the phone at eye level about a metre away rather than shooting a selfie." },
      { q: "Can I smile or wear glasses in a passport photo?", a: "No on both counts in most countries. A neutral expression with the mouth closed is required, and the US, UK and most Schengen states no longer permit glasses in passport photos." },
      { q: "Why do passport photos get rejected most often?", a: "Incorrect head size within the frame is the leading cause, followed by shadows on the background, a non-neutral expression, and low-resolution or heavily compressed image files." },
      { q: "Is the passport photo maker free?", a: "Yes. It is free with no account and no watermark, and it runs inside your browser, so your photo is never uploaded to a server." },
    ],
    cta: { toolSlug: "photo-id-maker", heading: "Make a compliant passport photo", body: "Pick US, UK, Schengen, Pakistani passport or NADRA CNIC sizing and export a correctly cropped photo — free, in your browser." },
    sources: [
      { label: "US Department of State — Passport photo requirements", href: "https://travel.state.gov/content/travel/en/passports/how-apply/photos.html" },
      { label: "GOV.UK — Passport photo rules", href: "https://www.gov.uk/photos-for-passports" },
      { label: "ICAO — Machine Readable Travel Documents (Doc 9303)", href: "https://www.icao.int/publications/pages/publication.aspx?docnum=9303" },
      { label: "NADRA — Pakistan National Database and Registration Authority", href: "https://www.nadra.gov.pk/" },
    ],
  },
];

export function findPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function postsByLang(lang: BlogLang): BlogPost[] {
  return posts.filter((p) => (p.lang ?? "en") === lang);
}

export const blogLangs: { code: BlogLang; label: string; nativeLabel: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
];

export function dirForLang(lang: BlogLang | undefined): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

export function langLabel(lang: BlogLang | undefined): string {
  const entry = blogLangs.find((l) => l.code === (lang ?? "en"));
  return entry ? entry.nativeLabel : "English";
}

export function formatBlogDate(iso: string, lang: BlogLang = "en"): string {
  const localeMap: Record<BlogLang, string> = { en: "en-US", fr: "fr-FR", de: "de-DE", ar: "ar" };
  return new Date(iso).toLocaleDateString(localeMap[lang], { year: "numeric", month: "long", day: "numeric" });
}
