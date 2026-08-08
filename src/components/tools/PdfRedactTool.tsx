import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

export function PdfRedactTool() {
  const tool = tools.find((t) => t.slug === "pdf-redact")!;
  const [file, setFile] = useState<File | null>(null);
  const [patterns, setPatterns] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || x.name.toLowerCase().endsWith(".pdf"));
    if (!f) { setStatus({ kind: "error", message: "Please choose a PDF." }); return; }
    setFile(f);
    setStatus({ kind: "idle" });
  };

  const redact = async () => {
    if (!file) return;
    const terms = patterns.split("\n").map((s) => s.trim()).filter(Boolean);
    if (terms.length === 0) { setStatus({ kind: "error", message: "Add at least one word or phrase to redact." }); return; }
    try {
      setStatus({ kind: "working", message: "Loading PDF…", progress: 10 });
      const [pdfjs, pdfLib] = await Promise.all([loadPdfjs(), import("pdf-lib")]);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await pdfjs.getDocument({ data: bytes.slice() }).promise;
      const out = await pdfLib.PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
      const pages = out.getPages();
      let hits = 0;
      for (let p = 1; p <= src.numPages; p++) {
        setStatus({ kind: "working", message: `Scanning page ${p} of ${src.numPages}…`, progress: 10 + (p / src.numPages) * 85 });
        const page = await src.getPage(p);
        const viewport = page.getViewport({ scale: 1 });
        const text = await page.getTextContent();
        const target = pages[p - 1];
        const pageH = target.getHeight();
        for (const it of text.items as any[]) {
          const str = String(it.str);
          if (!str) continue;
          for (const term of terms) {
            const idx = str.toLowerCase().indexOf(term.toLowerCase());
            if (idx === -1) continue;
            const x = it.transform[4];
            const y = it.transform[5];
            const w = it.width ?? Math.max(1, str.length * 4);
            const h = it.height ?? 10;
            // pdf-lib origin bottom-left; pdfjs viewport top-left — but transform is already bottom-left, so use directly.
            target.drawRectangle({
              x: Math.max(0, x - 1),
              y: Math.max(0, Math.min(pageH, y) - 1),
              width: Math.min(viewport.width, w + 2),
              height: h + 2,
              color: pdfLib.rgb(0, 0, 0),
            });
            hits++;
          }
        }
      }
      if (hits === 0) throw new Error("No matches found for those terms in this PDF.");
      setStatus({ kind: "working", message: "Writing PDF…", progress: 97 });
      const outBytes = await out.save();
      const base = file.name.replace(/\.pdf$/i, "");
      downloadBlob(new Blob([outBytes as BlobPart], { type: "application/pdf" }), `${base}-redacted.pdf`);
      setStatus({ kind: "success", message: `Redacted ${hits} match(es) → PDF downloaded.` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a text-based PDF (this tool searches selectable text — scanned PDFs need OCR first).",
        "Enter the words or phrases to redact — one per line. Case-insensitive.",
        "Click Redact — the tool overlays solid black rectangles on every match and downloads a new PDF.",
      ]}
    >
      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file with selectable text" />
      ) : (
        <>
          <FileList files={[file]} onRemove={() => setFile(null)} />
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Terms to redact (one per line)</span>
            <textarea
              value={patterns}
              onChange={(e) => setPatterns(e.target.value)}
              rows={6}
              spellCheck={false}
              placeholder={"John Smith\nAB-12345\nconfidential"}
              className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={redact} disabled={status.kind === "working"}>Redact & download</PrimaryButton>
            <GhostButton onClick={() => setFile(null)}>Choose another</GhostButton>
          </div>
          <p className="font-mono text-xs text-graphite/70">
            Note: rectangles are drawn on top of the text and the underlying text is not removed. For legal-grade redaction, flatten the result with our Compress PDF tool afterwards (rasterizes each page).
          </p>
        </>
      )}
    </ToolShell>
  );
}