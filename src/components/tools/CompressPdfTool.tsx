import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, formatBytes } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

type Level = "low" | "recommended" | "high";
const PRESETS: Record<Level, { scale: number; quality: number; label: string }> = {
  low: { scale: 2.0, quality: 0.85, label: "Low compression · best quality" },
  recommended: { scale: 1.5, quality: 0.7, label: "Recommended · balanced" },
  high: { scale: 1.0, quality: 0.5, label: "High compression · smallest file" },
};

export function CompressPdfTool() {
  const tool = tools.find((t) => t.slug === "compress-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>("recommended");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const [result, setResult] = useState<{ before: number; after: number } | null>(null);

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || x.name.toLowerCase().endsWith(".pdf"));
    if (!f) return setStatus({ kind: "error", message: "Please choose a PDF file." });
    setFile(f);
    setResult(null);
    setStatus({ kind: "idle" });
  };

  const compress = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading PDF…", progress: 3 });
      const preset = PRESETS[level];
      const pdfjs = await loadPdfjs();
      const { jsPDF } = await import("jspdf");
      const data = new Uint8Array(await file.arrayBuffer());
      const src = await pdfjs.getDocument({ data }).promise;
      const pageCount = src.numPages;
      let out: import("jspdf").jsPDF | null = null;

      for (let i = 1; i <= pageCount; i++) {
        setStatus({ kind: "working", message: `Compressing page ${i} of ${pageCount}…`, progress: 5 + (i / pageCount) * 90 });
        const page = await src.getPage(i);
        const vp1 = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: preset.scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(vp.width);
        canvas.height = Math.ceil(vp.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unsupported");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // pdfjs v6 requires the canvas in the render params
        await page.render({ canvas, canvasContext: ctx, viewport: vp } as unknown as Parameters<typeof page.render>[0]).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", preset.quality);
        const orientation = vp1.width >= vp1.height ? "landscape" : "portrait";
        if (!out) {
          out = new jsPDF({ unit: "pt", format: [vp1.width, vp1.height], orientation });
        } else {
          out.addPage([vp1.width, vp1.height], orientation);
        }
        out.addImage(dataUrl, "JPEG", 0, 0, vp1.width, vp1.height, undefined, "FAST");
      }

      if (!out) throw new Error("No pages produced");
      setStatus({ kind: "working", message: "Writing PDF…", progress: 97 });
      const blob = out.output("blob");
      const after = blob.size;
      const before = file.size;
      setResult({ before, after });
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + "-compressed.pdf");
      const pct = Math.max(0, Math.round(((before - after) / before) * 100));
      setStatus({
        kind: "success",
        message:
          after < before
            ? `${formatBytes(before)} → ${formatBytes(after)} · ${pct}% smaller. Downloaded.`
            : `${formatBytes(before)} → ${formatBytes(after)}. This PDF was already highly optimized; try a higher compression level.`,
      });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not process this PDF. It may be encrypted or corrupted. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop one PDF and pick a compression level.",
        "Each page is rasterized to an image and re-encoded as JPEG at the chosen quality.",
        "A new, smaller PDF is built and downloaded to your device.",
      ]}
    >
      <div className="rounded-xl border border-line bg-paper-2/50 p-4 text-xs text-graphite">
        <strong className="font-mono uppercase tracking-wider text-ink">Note:</strong> real compression
        rasterizes each page, so text becomes an image and won't be selectable in the output.
      </div>
      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file" />
      ) : (
        <FileList files={[file]} onRemove={() => setFile(null)} />
      )}

      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Compression level</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(PRESETS) as Level[]).map((k) => (
            <label
              key={k}
              className={
                "cursor-pointer rounded-xl border p-3 text-sm transition " +
                (level === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")
              }
            >
              <input type="radio" name="level" value={k} checked={level === k} onChange={() => setLevel(k)} className="sr-only" />
              <p className="font-mono text-xs uppercase tracking-wider">{k}</p>
              <p className={"mt-1 text-xs " + (level === k ? "text-paper/80" : "text-graphite/70")}>{PRESETS[k].label}</p>
            </label>
          ))}
        </div>
      </fieldset>

      <PrimaryButton onClick={compress} disabled={!file || status.kind === "working"}>
        Compress PDF
      </PrimaryButton>

      {result && status.kind === "success" && (
        <p className="font-mono text-sm text-ink">
          {formatBytes(result.before)} → <span className="text-signal">{formatBytes(result.after)}</span>
        </p>
      )}
    </ToolShell>
  );
}
