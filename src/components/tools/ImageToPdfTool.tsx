import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

type Size = "A4" | "Letter" | "Fit";
// Point dimensions
const SIZES: Record<Exclude<Size, "Fit">, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
};

export function ImageToPdfTool() {
  const tool = tools.find((t) => t.slug === "image-to-pdf")!;
  const [files, setFiles] = useState<File[]>([]);
  const [size, setSize] = useState<Size>("A4");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const add = (fs: File[]) =>
    setFiles((prev) => [...prev, ...fs.filter((f) => f.type.startsWith("image/"))]);
  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    setFiles((prev) => {
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
  };

  const run = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Reading images…", progress: 3 });
      const { jsPDF } = await import("jspdf");
      let doc: import("jspdf").jsPDF | null = null;
      const margin = 20;

      for (let i = 0; i < files.length; i++) {
        setStatus({ kind: "working", message: `Adding ${files[i].name}…`, progress: 5 + (i / files.length) * 90 });
        const dataUrl = await readFileAsDataURL(files[i]);
        const img = await loadImage(dataUrl);
        const format = files[i].type === "image/png" ? "PNG" : "JPEG";
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        let pageW: number;
        let pageH: number;
        let drawW: number;
        let drawH: number;
        let x: number;
        let y: number;

        if (size === "Fit") {
          pageW = iw;
          pageH = ih;
          drawW = iw;
          drawH = ih;
          x = 0;
          y = 0;
        } else {
          [pageW, pageH] = SIZES[size];
          const availW = pageW - margin * 2;
          const availH = pageH - margin * 2;
          const r = Math.min(availW / iw, availH / ih);
          drawW = iw * r;
          drawH = ih * r;
          x = (pageW - drawW) / 2;
          y = (pageH - drawH) / 2;
        }
        const orientation = pageW >= pageH ? "landscape" : "portrait";
        if (!doc) {
          doc = new jsPDF({ unit: "pt", format: [pageW, pageH], orientation });
        } else {
          doc.addPage([pageW, pageH], orientation);
        }
        doc.addImage(dataUrl, format, x, y, drawW, drawH, undefined, "FAST");
      }

      if (!doc) throw new Error("No output");
      setStatus({ kind: "working", message: "Writing PDF…", progress: 97 });
      const blob = doc.output("blob");
      downloadBlob(blob, "images.pdf");
      setStatus({ kind: "success", message: `Built PDF with ${files.length} page(s) → images.pdf.` });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not build a PDF from these images. Make sure they are valid JPG or PNG files." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop your JPG or PNG images and reorder them into the sequence you want.",
        "Choose a page size — A4, Letter, or fit each image exactly.",
        "A single PDF with one image per page is generated and downloaded.",
      ]}
    >
      <Dropzone accept="image/*" onFiles={add} hint="JPG or PNG images" />
      <FileList files={files} onRemove={remove} onMove={move} />

      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Page size</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["A4", "Letter", "Fit"] as Size[]).map((k) => (
            <label
              key={k}
              className={
                "cursor-pointer rounded-xl border p-3 text-sm transition " +
                (size === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")
              }
            >
              <input type="radio" name="size" value={k} checked={size === k} onChange={() => setSize(k)} className="sr-only" />
              <p className="font-mono text-xs uppercase tracking-wider">{k}</p>
              <p className={"mt-1 text-xs " + (size === k ? "text-paper/80" : "text-graphite/70")}>
                {k === "Fit" ? "Match each image's size" : `Standard ${k} pages`}
              </p>
            </label>
          ))}
        </div>
      </fieldset>

      <PrimaryButton onClick={run} disabled={files.length === 0 || status.kind === "working"}>
        Build PDF
      </PrimaryButton>
    </ToolShell>
  );
}
