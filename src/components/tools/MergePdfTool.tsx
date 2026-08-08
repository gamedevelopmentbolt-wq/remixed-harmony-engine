import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function MergePdfTool() {
  const tool = tools.find((t) => t.slug === "merge-pdf")!;
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const add = (fs: File[]) =>
    setFiles((prev) => [...prev, ...fs.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"))]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    setFiles((prev) => {
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
  };

  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const merge = async () => {
    if (files.length < 2) {
      setStatus({ kind: "error", message: "Add at least two PDF files to merge." });
      return;
    }
    try {
      setStatus({ kind: "working", message: "Reading PDF files…", progress: 5 });
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setStatus({ kind: "working", message: `Merging ${files[i].name}…`, progress: 10 + (i / files.length) * 85 });
        const bytes = new Uint8Array(await files[i].arrayBuffer());
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      setStatus({ kind: "working", message: "Writing merged.pdf…", progress: 97 });
      const bytes = await out.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "merged.pdf");
      setStatus({ kind: "success", message: `Merged ${files.length} PDFs → merged.pdf downloaded.` });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not merge one or more files. Make sure each is a valid, unencrypted PDF. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop two or more PDF files into the box and reorder them if needed.",
        "Click Merge — every page is copied into a single new PDF in order.",
        "Your browser downloads merged.pdf. Nothing is uploaded to a server.",
      ]}
    >
      <Dropzone accept="application/pdf,.pdf" onFiles={add} hint="PDF files only — drop 2 or more" />
      <FileList files={files} onRemove={remove} onMove={move} />
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={merge} disabled={files.length < 2 || status.kind === "working"}>
          Merge PDFs
        </PrimaryButton>
        {files.length > 0 && (
          <button
            type="button"
            onClick={() => setFiles([])}
            className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
          >
            Clear list
          </button>
        )}
      </div>
    </ToolShell>
  );
}
