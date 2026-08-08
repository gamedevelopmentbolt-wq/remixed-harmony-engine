import { useEffect, useState } from "react";
import { RotateCw, ArrowLeft, ArrowRight, X } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

interface Page {
  index: number; // original index
  rotation: number; // 0/90/180/270
  thumb: string;
}

export function RotatePdfTool() {
  const tool = tools.find((t) => t.slug === "rotate-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  useEffect(() => {
    if (!file) {
      setPages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setStatus({ kind: "working", message: "Rendering thumbnails…", progress: 5 });
        const pdfjs = await loadPdfjs();
        const buf = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
        const out: Page[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          setStatus({ kind: "working", message: `Rendering page ${i}/${doc.numPages}…`, progress: 5 + (i / doc.numPages) * 90 });
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          out.push({ index: i - 1, rotation: 0, thumb: canvas.toDataURL("image/jpeg", 0.7) });
        }
        if (!cancelled) {
          setPages(out);
          setStatus({ kind: "idle" });
        }
      } catch (err) {
        console.error(err);
        const detail = err instanceof Error ? err.message : String(err);
        setStatus({ kind: "error", message: "Could not read this PDF. (" + detail + ")" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const rotate = (i: number, delta: number) =>
    setPages((prev) => prev.map((p, idx) => (idx === i ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p)));
  const move = (i: number, dir: -1 | 1) => {
    setPages((prev) => {
      const to = i + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [it] = next.splice(i, 1);
      next.splice(to, 0, it);
      return next;
    });
  };
  const remove = (i: number) => setPages((prev) => prev.filter((_, idx) => idx !== i));

  const run = async () => {
    if (!file || pages.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Writing PDF…", progress: 10 });
      const { PDFDocument, degrees } = await import("pdf-lib");
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const [copied] = await out.copyPages(src, [p.index]);
        const existingRot = copied.getRotation().angle;
        copied.setRotation(degrees((existingRot + p.rotation) % 360));
        out.addPage(copied);
        setStatus({ kind: "working", message: `Adding page ${i + 1}/${pages.length}…`, progress: 10 + (i / pages.length) * 85 });
      }
      const bytes = await out.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), file.name.replace(/\.pdf$/i, "") + "-edited.pdf");
      setStatus({ kind: "success", message: "Edited PDF downloaded." });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not save PDF. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF — the pages appear as thumbnails.",
        "Rotate any page 90° at a time, reorder with the arrows, or remove pages.",
        "Click Save and download the edited PDF. Everything runs locally.",
      ]}
    >
      {!file && <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={(fs) => setFile(fs[0] ?? null)} hint="One PDF file" />}
      {file && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-ink">
            {file.name} · <span className="text-graphite/70">{pages.length} pages</span>
          </p>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
          >
            Choose another file
          </button>
        </div>
      )}
      {pages.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pages.map((p, i) => (
            <li key={`${p.index}-${i}`} className="rounded-xl border border-line bg-white p-3">
              <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-md bg-paper-2">
                <img
                  src={p.thumb}
                  alt={`Page ${p.index + 1}`}
                  style={{ transform: `rotate(${p.rotation}deg)` }}
                  className="max-h-full max-w-full object-contain transition-transform"
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                  Pg {p.index + 1} · {p.rotation}°
                </span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} aria-label="Move left" className="grid h-7 w-7 place-items-center rounded border border-line text-graphite hover:border-ink">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="Move right" className="grid h-7 w-7 place-items-center rounded border border-line text-graphite hover:border-ink">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => rotate(i, 90)} aria-label="Rotate 90°" className="grid h-7 w-7 place-items-center rounded border border-line text-graphite hover:border-ink">
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => remove(i)} aria-label="Remove page" className="grid h-7 w-7 place-items-center rounded border border-line text-graphite hover:border-signal hover:text-signal">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <PrimaryButton onClick={run} disabled={!file || pages.length === 0 || status.kind === "working"}>
        Save edited PDF
      </PrimaryButton>
    </ToolShell>
  );
}
