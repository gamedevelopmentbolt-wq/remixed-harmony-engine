import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

export function PdfToPptxTool() {
  const tool = tools.find((t) => t.slug === "pdf-to-pptx")!;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading PDF…", progress: 5 });
      const pdfjs = await loadPdfjs();
      const buf = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: buf }).promise;

      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches

      for (let i = 1; i <= doc.numPages; i++) {
        setStatus({ kind: "working", message: `Converting page ${i}/${doc.numPages}…`, progress: 5 + (i / doc.numPages) * 90 });
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        const slide = pptx.addSlide();
        // Fit page into 13.33x7.5 preserving aspect ratio
        const slideW = 13.33;
        const slideH = 7.5;
        const pageAspect = canvas.width / canvas.height;
        const slideAspect = slideW / slideH;
        let w = slideW;
        let h = slideH;
        if (pageAspect > slideAspect) {
          h = slideW / pageAspect;
        } else {
          w = slideH * pageAspect;
        }
        slide.addImage({ data: dataUrl, x: (slideW - w) / 2, y: (slideH - h) / 2, w, h });
      }

      setStatus({ kind: "working", message: "Writing .pptx…", progress: 97 });
      const blob = (await pptx.write({ outputType: "blob" })) as Blob;
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + ".pptx");
      setStatus({ kind: "success", message: `${doc.numPages} slides written.` });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not convert this PDF. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF file.",
        "Each page is rendered as a high-quality image and placed on its own slide.",
        "Download the .pptx and open it in PowerPoint, Keynote or Google Slides.",
      ]}
    >
      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={(fs) => setFile(fs[0] ?? null)} hint="One PDF file" />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-ink">{file.name}</p>
          <button type="button" onClick={() => setFile(null)} className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink">
            Choose another
          </button>
        </div>
      )}
      <p className="text-xs text-graphite/70">
        Each PDF page becomes a full-slide image. Text won't be individually editable but the visual layout is preserved exactly.
      </p>
      <PrimaryButton onClick={run} disabled={!file || status.kind === "working"}>
        Convert to PowerPoint
      </PrimaryButton>
    </ToolShell>
  );
}
