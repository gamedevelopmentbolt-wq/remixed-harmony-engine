import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function SplitPdfTool() {
  const tool = tools.find((t) => t.slug === "split-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || x.name.toLowerCase().endsWith(".pdf"));
    if (!f) {
      setStatus({ kind: "error", message: "Please choose a PDF file." });
      return;
    }
    setFile(f);
    setStatus({ kind: "idle" });
  };

  const split = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Reading PDF…", progress: 5 });
      const [{ PDFDocument }, JSZipMod] = await Promise.all([import("pdf-lib"), import("jszip")]);
      const JSZip = JSZipMod.default;
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const count = src.getPageCount();
      if (count < 1) throw new Error("No pages");
      const zip = new JSZip();
      const baseName = file.name.replace(/\.pdf$/i, "");
      for (let i = 0; i < count; i++) {
        setStatus({ kind: "working", message: `Extracting page ${i + 1} of ${count}…`, progress: 5 + (i / count) * 90 });
        const doc = await PDFDocument.create();
        const [pg] = await doc.copyPages(src, [i]);
        doc.addPage(pg);
        const bytes = await doc.save();
        zip.file(`${baseName}-page-${String(i + 1).padStart(3, "0")}.pdf`, bytes);
      }
      setStatus({ kind: "working", message: "Building ZIP…", progress: 97 });
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      downloadBlob(blob, "split-pages.zip");
      setStatus({ kind: "success", message: `Split into ${count} page(s) → split-pages.zip downloaded.` });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not split this file. Make sure it's a valid, unencrypted PDF. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop one PDF file into the box.",
        "Click Split — each page becomes its own single-page PDF.",
        "All pages are bundled into split-pages.zip and downloaded.",
      ]}
    >
      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file" />
      ) : (
        <FileList files={[file]} onRemove={() => setFile(null)} />
      )}
      <div>
        <PrimaryButton onClick={split} disabled={!file || status.kind === "working"}>
          Split into pages
        </PrimaryButton>
      </div>
    </ToolShell>
  );
}
