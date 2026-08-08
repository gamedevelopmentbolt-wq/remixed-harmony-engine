import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

type Q = "standard" | "high" | "maximum";
const Q_MAP: Record<Q, number> = { standard: 0.6, high: 0.85, maximum: 0.95 };

export function PdfToJpgTool() {
  const tool = tools.find((t) => t.slug === "pdf-to-jpg")!;
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Q>("high");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || x.name.toLowerCase().endsWith(".pdf"));
    if (!f) return setStatus({ kind: "error", message: "Please choose a PDF file." });
    setFile(f);
    setStatus({ kind: "idle" });
  };

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading PDF…", progress: 3 });
      const pdfjs = await loadPdfjs();
      const q = Q_MAP[quality];
      const src = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const total = src.numPages;
      const base = file.name.replace(/\.pdf$/i, "");
      const blobs: { name: string; blob: Blob }[] = [];

      for (let i = 1; i <= total; i++) {
        setStatus({ kind: "working", message: `Rendering page ${i} of ${total}…`, progress: 5 + (i / total) * 90 });
        const page = await src.getPage(i);
        const vp = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(vp.width);
        canvas.height = Math.ceil(vp.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unsupported");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport: vp } as unknown as Parameters<typeof page.render>[0]).promise;
        const blob: Blob = await new Promise((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", q),
        );
        blobs.push({ name: `${base}-page-${String(i).padStart(3, "0")}.jpg`, blob });
      }

      if (blobs.length === 1) {
        downloadBlob(blobs[0].blob, blobs[0].name);
        setStatus({ kind: "success", message: `Downloaded ${blobs[0].name}.` });
      } else {
        setStatus({ kind: "working", message: "Bundling ZIP…", progress: 97 });
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (const b of blobs) zip.file(b.name, b.blob);
        const out = await zip.generateAsync({ type: "blob" });
        downloadBlob(out, `${base}-images.zip`);
        setStatus({ kind: "success", message: `Exported ${blobs.length} images → ${base}-images.zip.` });
      }
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not render this PDF. It may be encrypted or corrupted. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop one PDF and pick an image quality.",
        "Every page is rendered to a canvas and exported as a JPG.",
        "One page downloads as a JPG; multiple pages are bundled into a ZIP.",
      ]}
    >
      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file" />
      ) : (
        <FileList files={[file]} onRemove={() => setFile(null)} />
      )}
      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Image quality</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(Q_MAP) as Q[]).map((k) => (
            <label
              key={k}
              className={
                "cursor-pointer rounded-xl border p-3 text-sm transition " +
                (quality === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")
              }
            >
              <input type="radio" name="q" value={k} checked={quality === k} onChange={() => setQuality(k)} className="sr-only" />
              <p className="font-mono text-xs uppercase tracking-wider">{k}</p>
              <p className={"mt-1 text-xs " + (quality === k ? "text-paper/80" : "text-graphite/70")}>
                JPEG quality {Q_MAP[k]}
              </p>
            </label>
          ))}
        </div>
      </fieldset>
      <PrimaryButton onClick={run} disabled={!file || status.kind === "working"}>
        Convert to JPG
      </PrimaryButton>
    </ToolShell>
  );
}
