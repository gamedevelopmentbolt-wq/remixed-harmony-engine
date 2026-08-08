import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

const LANGS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "tr", label: "Turkish" },
];

interface PageText {
  page: number;
  text: string;
}

async function extractPages(file: File): Promise<PageText[]> {
  const pdfjs = await loadPdfjs();
  const buf = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const pages: PageText[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const parts: string[] = [];
    let lastY: number | null = null;
    for (const item of tc.items as Array<{ str: string; transform?: number[] }>) {
      const y = item.transform ? item.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) parts.push("\n");
      parts.push(item.str);
      if (y !== null) lastY = y;
    }
    pages.push({ page: p, text: parts.join(" ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() });
  }
  return pages;
}

function chunkText(text: string, max = 450): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n+/);
  let buf = "";
  const flush = () => {
    if (buf.trim()) chunks.push(buf.trim());
    buf = "";
  };
  for (const para of paragraphs) {
    if (!para.trim()) continue;
    if (para.length <= max) {
      if ((buf + "\n" + para).length > max) flush();
      buf = buf ? buf + "\n" + para : para;
      continue;
    }
    // paragraph too long — split on sentence/word boundaries
    flush();
    const sentences = para.split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
      if (s.length > max) {
        // hard split on spaces
        let start = 0;
        while (start < s.length) {
          let end = Math.min(start + max, s.length);
          if (end < s.length) {
            const sp = s.lastIndexOf(" ", end);
            if (sp > start + 100) end = sp;
          }
          chunks.push(s.slice(start, end).trim());
          start = end;
        }
      } else {
        if ((buf + " " + s).length > max) flush();
        buf = buf ? buf + " " + s : s;
      }
    }
    flush();
  }
  flush();
  return chunks;
}

async function translateChunk(text: string, source: string, target: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation service HTTP ${res.status}`);
  const json = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number };
  const out = json.responseData?.translatedText;
  if (!out) throw new Error("Empty translation response");
  // MyMemory sometimes returns HTML entities
  return out
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function translatePageText(text: string, source: string, target: string): Promise<string> {
  if (!text.trim()) return "";
  const chunks = chunkText(text);
  const out: string[] = [];
  for (const c of chunks) {
    try {
      const t = await translateChunk(c, source, target);
      out.push(t);
    } catch {
      out.push(c); // fall back to original chunk on failure
    }
  }
  return out.join("\n");
}

function renderPageToCanvas(text: string, pageNum: number, totalPages: number, langCode: string): HTMLCanvasElement {
  // Render at ~150 DPI letter size: 1275 x 1650
  const W = 1275;
  const H = 1650;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#111111";
  const isRTL = langCode === "ar" || langCode === "ur";
  const fontStack =
    langCode === "zh" || langCode === "ja" || langCode === "ko"
      ? '"Noto Sans CJK","Hiragino Sans","Microsoft YaHei",sans-serif'
      : 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  ctx.font = `20px ${fontStack}`;
  ctx.textBaseline = "top";
  ctx.direction = isRTL ? "rtl" : "ltr";
  ctx.textAlign = isRTL ? "right" : "left";
  const margin = 90;
  const maxW = W - margin * 2;
  const lineHeight = 28;
  const startX = isRTL ? W - margin : margin;
  let y = margin;

  const paragraphs = text.split(/\n/);
  for (const para of paragraphs) {
    if (!para.trim()) {
      y += lineHeight / 2;
      continue;
    }
    const words = para.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, startX, y);
        y += lineHeight;
        if (y > H - margin) break;
        line = w;
      } else {
        line = test;
      }
    }
    if (line && y <= H - margin) {
      ctx.fillText(line, startX, y);
      y += lineHeight;
    }
    y += 6;
    if (y > H - margin) break;
  }

  // Footer
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  ctx.fillStyle = "#888";
  ctx.font = "14px system-ui,sans-serif";
  ctx.fillText(`Page ${pageNum} of ${totalPages}`, W / 2, H - 40);
  return canvas;
}

export function PdfTranslatorTool() {
  const tool = tools.find((t) => t.slug === "pdf-translator")!;
  const [files, setFiles] = useState<File[]>([]);
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("es");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const [preview, setPreview] = useState<{ original: string; translated: string } | null>(null);

  const add = (fs: File[]) =>
    setFiles(fs.filter((f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name)).slice(0, 1));
  const remove = () => {
    setFiles([]);
    setPreview(null);
  };

  const run = async (mode: "pdf" | "txt") => {
    if (files.length === 0) return;
    if (source === target) {
      setStatus({ kind: "error", message: "Source and target languages are the same." });
      return;
    }
    try {
      setStatus({ kind: "working", message: "Extracting text from PDF…", progress: 5 });
      const pages = await extractPages(files[0]);
      const translated: PageText[] = [];
      for (let i = 0; i < pages.length; i++) {
        setStatus({
          kind: "working",
          message: `Translating page ${i + 1} of ${pages.length}…`,
          progress: 10 + (i / pages.length) * 80,
        });
        const t = await translatePageText(pages[i].text, source, target);
        translated.push({ page: pages[i].page, text: t });
      }
      const baseName = files[0].name.replace(/\.pdf$/i, "");
      if (mode === "txt") {
        const body = translated
          .map((p) => `--- Page ${p.page} ---\n${p.text}`)
          .join("\n\n");
        downloadBlob(new Blob([body], { type: "text/plain" }), `${baseName}.${target}.txt`);
      } else {
        setStatus({ kind: "working", message: "Building translated PDF…", progress: 92 });
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({ unit: "pt", format: "letter" });
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        for (let i = 0; i < translated.length; i++) {
          const canvas = renderPageToCanvas(translated[i].text, translated[i].page, translated.length, target);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, "JPEG", 0, 0, pw, ph);
        }
        const blob = pdf.output("blob");
        downloadBlob(blob, `${baseName}.${target}.pdf`);
      }
      setPreview({
        original: pages[0]?.text.slice(0, 400) ?? "",
        translated: translated[0]?.text.slice(0, 400) ?? "",
      });
      setStatus({ kind: "success", message: `Translated ${pages.length} page(s) to ${LANGS.find((l) => l.code === target)?.label}.` });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: `Translation failed. (${detail})` });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF — its text is extracted directly in your browser.",
        "Pick a source and target language from 15+ supported options.",
        "Download the translated result as a PDF (same page count) or plain-text file.",
      ]}
    >
      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        <strong className="font-mono text-[11px] uppercase tracking-widest">Heads up · network</strong>
        <p className="mt-1">
          Your PDF stays in your browser — only the extracted <em>text</em> is sent to the free MyMemory translation API to produce the translation.
          Don't use this tool for confidential documents.
        </p>
      </div>

      <Dropzone onFiles={add} accept="application/pdf,.pdf" multiple={false} hint="One PDF at a time" />
      {files.length > 0 && (
        <FileList files={files} onRemove={remove} />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Source language</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm text-ink"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Translate to</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm text-ink"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={() => run("pdf")} disabled={files.length === 0 || status.kind === "working"}>
          Translate & download PDF
        </PrimaryButton>
        <PrimaryButton onClick={() => run("txt")} disabled={files.length === 0 || status.kind === "working"}>
          Download as .txt
        </PrimaryButton>
      </div>

      {preview && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-line bg-white p-3">
            <div className="font-mono text-[11px] uppercase tracking-widest text-graphite">Original (page 1 excerpt)</div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{preview.original}</p>
          </div>
          <div className="rounded-md border border-line bg-white p-3">
            <div className="font-mono text-[11px] uppercase tracking-widest text-signal">Translated (page 1 excerpt)</div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{preview.translated}</p>
          </div>
        </div>
      )}
    </ToolShell>
  );
}