import { useState } from "react";
import { Copy, Download, FileText } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

interface WordBox {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

const LANGS: { code: string; label: string }[] = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "por", label: "Portuguese" },
  { code: "ita", label: "Italian" },
  { code: "nld", label: "Dutch" },
  { code: "rus", label: "Russian" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "ara", label: "Arabic" },
];

// Preprocess a canvas: grayscale + adaptive contrast for better Tesseract accuracy.
function preprocess(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  // grayscale + auto-contrast
  let min = 255, max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
    d[i] = d[i + 1] = d[i + 2] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = Math.max(1, max - min);
  for (let i = 0; i < d.length; i += 4) {
    const g = ((d[i] - min) * 255) / range;
    d[i] = d[i + 1] = d[i + 2] = g;
  }
  ctx.putImageData(img, 0, 0);
}

export function OcrTool() {
  const tool = tools.find((t) => t.slug === "ocr")!;
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [lang, setLang] = useState("eng");
  const [preprocessOn, setPreprocessOn] = useState(true);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const add = (fs: File[]) =>
    setFiles((prev) => [
      ...prev,
      ...fs.filter((f) => f.type.startsWith("image/") || f.type === "application/pdf" || /\.pdf$/i.test(f.name)),
    ]);
  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const rasterizePdf = async (file: File): Promise<HTMLCanvasElement[]> => {
    const { loadPdfjs } = await import("@/lib/pdfjs-loader");
    const pdfjs = await loadPdfjs();
    const buf = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    const canvases: HTMLCanvasElement[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale: 2.5 });
      const c = document.createElement("canvas");
      c.width = viewport.width;
      c.height = viewport.height;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvas: c, canvasContext: ctx, viewport } as never).promise;
      canvases.push(c);
    }
    return canvases;
  };

  const imageToCanvas = async (f: File): Promise<HTMLCanvasElement> => {
    const url = URL.createObjectURL(f);
    try {
      const img = new Image();
      img.src = url;
      await new Promise((r, j) => { img.onload = r; img.onerror = j; });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      return c;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const run = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Loading OCR engine (first run downloads language model)…", progress: 4 });
      const Tesseract = (await import("tesseract.js")).default;
      const worker = await Tesseract.createWorker(lang, 1, {
        logger: (m: { status?: string; progress?: number }) => {
          if (typeof m.progress === "number") {
            setStatus({
              kind: "working",
              message: `${m.status ?? "Working"}…`,
              progress: 8 + m.progress * 88,
            });
          }
        },
      });
      const chunks: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setStatus({ kind: "working", message: `Reading ${f.name}…`, progress: 10 + (i / files.length) * 85 });
        const canvases: HTMLCanvasElement[] =
          f.type === "application/pdf" || /\.pdf$/i.test(f.name)
            ? await rasterizePdf(f)
            : [await imageToCanvas(f)];
        for (let p = 0; p < canvases.length; p++) {
          if (preprocessOn) preprocess(canvases[p]);
          const { data } = await worker.recognize(canvases[p]);
          chunks.push(canvases.length > 1
            ? `--- ${f.name} · page ${p + 1} ---\n${data.text.trim()}`
            : `--- ${f.name} ---\n${data.text.trim()}`);
        }
      }
      await worker.terminate();
      const out = chunks.join("\n\n");
      setText(out);
      setStatus({ kind: "success", message: `Extracted text from ${files.length} file(s).` });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "OCR failed. Check the files are valid images or PDFs and try again." });
    }
  };

  const buildSearchablePdf = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Loading OCR engine…", progress: 4 });
      const Tesseract = (await import("tesseract.js")).default;
      const worker = await Tesseract.createWorker(lang, 1, {
        logger: (m: { status?: string; progress?: number }) => {
          if (typeof m.progress === "number") {
            setStatus({
              kind: "working",
              message: `${m.status ?? "Working"}…`,
              progress: 5 + m.progress * 70,
            });
          }
        },
      });
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const out = await PDFDocument.create();
      const font = await out.embedFont(StandardFonts.Helvetica);
      const invisible = rgb(0, 0, 0);

      for (let fi = 0; fi < files.length; fi++) {
        const f = files[fi];
        const canvases: HTMLCanvasElement[] =
          f.type === "application/pdf" || /\.pdf$/i.test(f.name)
            ? await rasterizePdf(f)
            : [await imageToCanvas(f)];
        for (let p = 0; p < canvases.length; p++) {
          setStatus({
            kind: "working",
            message: `OCR page ${p + 1}/${canvases.length} of ${f.name}…`,
            progress: 75 + ((fi + p / canvases.length) / files.length) * 20,
          });
          if (preprocessOn) preprocess(canvases[p]);
          const src = canvases[p];
          // Use Tesseract's words output for positioning.
          const res = await worker.recognize(src, {}, { blocks: true } as never);
          const words: WordBox[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const blocks = (res.data as any).blocks ?? [];
          for (const b of blocks) {
            for (const par of b.paragraphs ?? []) {
              for (const line of par.lines ?? []) {
                for (const w of line.words ?? []) {
                  if (w.text?.trim()) words.push({ text: w.text, bbox: w.bbox });
                }
              }
            }
          }
          const jpg = await new Promise<Blob>((res) => src.toBlob((b) => res(b!), "image/jpeg", 0.85));
          const jpgBytes = new Uint8Array(await jpg.arrayBuffer());
          const embedded = await out.embedJpg(jpgBytes);
          const page = out.addPage([src.width * 0.75, src.height * 0.75]); // 96dpi → 72dpi
          page.drawImage(embedded, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
          const sx = page.getWidth() / src.width;
          const sy = page.getHeight() / src.height;
          for (const w of words) {
            const { x0, y0, x1, y1 } = w.bbox;
            const wPt = (x1 - x0) * sx;
            const hPt = (y1 - y0) * sy;
            const size = Math.max(2, hPt * 0.9);
            const xPt = x0 * sx;
            const yPt = page.getHeight() - y1 * sy;
            page.drawText(w.text, {
              x: xPt, y: yPt, size, font, color: invisible, opacity: 0.0,
              maxWidth: wPt * 2,
            });
          }
        }
      }
      await worker.terminate();
      const bytes = await out.save();
      const base = files[0].name.replace(/\.[^.]+$/, "");
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${base}-searchable.pdf`);
      setStatus({ kind: "success", message: "Searchable PDF downloaded." });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Searchable PDF build failed. " + (err instanceof Error ? err.message : "") });
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setStatus({ kind: "success", message: "Copied to clipboard." });
  };
  const dl = () => downloadBlob(new Blob([text], { type: "text/plain" }), "ocr.txt");

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop images (JPG/PNG) or a PDF. Pages are rasterized at high resolution and auto-contrasted for accuracy.",
        "Tesseract.js downloads once per language and runs 100% in your browser — files never leave your device.",
        "Copy the text, download it as .txt, or export a searchable PDF with an invisible text layer.",
      ]}
    >
      <div className="rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-signal">
        First run per language downloads a ~10 MB model. Then it's cached and offline.
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-ink">Language</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="h-11 w-full rounded-md border border-line bg-white px-3 font-mono text-sm text-ink"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-1 font-mono text-xs uppercase tracking-wider text-ink">
          <input type="checkbox" checked={preprocessOn} onChange={(e) => setPreprocessOn(e.target.checked)} />
          Auto contrast + grayscale
        </label>
      </div>
      <Dropzone accept="image/*,.pdf,application/pdf" onFiles={add} hint="JPG, PNG or PDF" />
      <FileList files={files} onRemove={remove} />
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run} disabled={files.length === 0 || status.kind === "working"}>
          Extract text
        </PrimaryButton>
        <GhostButton type="button" onClick={buildSearchablePdf} disabled={files.length === 0 || status.kind === "working"}>
          <FileText className="mr-2 h-4 w-4" /> Build searchable PDF
        </GhostButton>
      </div>
      {text && (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-line bg-white p-3 font-mono text-sm text-ink"
          />
          <div className="flex flex-wrap gap-3">
            <GhostButton onClick={copy} type="button">
              <Copy className="mr-2 h-4 w-4" /> Copy
            </GhostButton>
            <GhostButton onClick={dl} type="button">
              <Download className="mr-2 h-4 w-4" /> Download .txt
            </GhostButton>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
