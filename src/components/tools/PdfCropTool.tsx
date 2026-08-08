import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function PdfCropTool() {
  const tool = tools.find((t) => t.slug === "pdf-crop")!;
  const [file, setFile] = useState<File | null>(null);
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  async function crop() {
    if (!file) return;
    setStatus({ kind: "working", message: "Cropping pages…" });
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      const pages = src.getPages();
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const box = { x: margins.left, y: margins.bottom, width: width - margins.left - margins.right, height: height - margins.top - margins.bottom };
        if (box.width > 0 && box.height > 0) {
          page.setCropBox(box.x, box.y, box.width, box.height);
          page.setMediaBox(box.x, box.y, box.width, box.height);
        }
      });
      const bytes = await src.save();
      const blob = new Blob([bytes as any], { type: "application/pdf" });
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + "-cropped.pdf");
      setStatus({ kind: "success", message: `Cropped ${pages.length} page(s).` });
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? "Failed to crop." });
    }
  }

  const Field = ({ label, k }: { label: string; k: keyof typeof margins }) => (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-ink">{label} (pt)</span>
      <input type="number" min={0} value={margins[k]} onChange={(e) => setMargins((m) => ({ ...m, [k]: Math.max(0, Number(e.target.value) || 0) }))}
        className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
    </label>
  );

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Upload a PDF with wide margins or extra white space around the content.",
        "Set how many points to trim from each edge (72 pt = 1 inch).",
        "Download a new PDF with tighter margins — great for reading on phones.",
      ]}>
      <Dropzone accept="application/pdf" multiple={false} onFiles={(fs) => setFile(fs[0])} />
      {file && (
        <>
          <p className="font-mono text-sm text-ink">{file.name}</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Top" k="top" />
            <Field label="Right" k="right" />
            <Field label="Bottom" k="bottom" />
            <Field label="Left" k="left" />
          </div>
          <PrimaryButton onClick={crop} loading={status.kind === "working"}>Crop PDF</PrimaryButton>
        </>
      )}
    </ToolShell>
  );
}
