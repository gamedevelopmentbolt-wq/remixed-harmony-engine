import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function PdfMetadataEditorTool() {
  const tool = tools.find((t) => t.slug === "pdf-metadata-editor")!;
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState({ title: "", author: "", subject: "", keywords: "", producer: "" });
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  async function load(f: File) {
    setFile(f);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await f.arrayBuffer());
      setMeta({
        title: src.getTitle() ?? "",
        author: src.getAuthor() ?? "",
        subject: src.getSubject() ?? "",
        keywords: (src.getKeywords() as any) ?? "",
        producer: src.getProducer() ?? "",
      });
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? "Failed to open PDF." });
    }
  }

  async function save() {
    if (!file) return;
    setStatus({ kind: "working", message: "Writing metadata…" });
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      src.setTitle(meta.title);
      src.setAuthor(meta.author);
      src.setSubject(meta.subject);
      src.setKeywords(meta.keywords.split(",").map((s) => s.trim()).filter(Boolean));
      src.setProducer(meta.producer || "EasyFileMagic");
      src.setModificationDate(new Date());
      const bytes = await src.save();
      downloadBlob(new Blob([bytes as any], { type: "application/pdf" }), file.name.replace(/\.pdf$/i, "") + "-metadata.pdf");
      setStatus({ kind: "success", message: "Metadata updated." });
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? "Failed to save." });
    }
  }

  const F = ({ label, k }: { label: string; k: keyof typeof meta }) => (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-ink">{label}</span>
      <input type="text" value={meta[k]} onChange={(e) => setMeta((m) => ({ ...m, [k]: e.target.value }))}
        className="mt-2 block w-full rounded-md border border-line bg-white p-2 text-sm" />
    </label>
  );

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Upload a PDF — its existing title, author and metadata are loaded automatically.",
        "Edit any field. Keywords accept a comma-separated list.",
        "Download the new PDF with clean, correct metadata for SEO and archiving.",
      ]}>
      <Dropzone accept="application/pdf" multiple={false} onFiles={(fs) => load(fs[0])} />
      {file && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <F label="Title" k="title" />
            <F label="Author" k="author" />
            <F label="Subject" k="subject" />
            <F label="Producer" k="producer" />
          </div>
          <F label="Keywords (comma-separated)" k="keywords" />
          <PrimaryButton onClick={save} loading={status.kind === "working"}>Save with new metadata</PrimaryButton>
        </>
      )}
    </ToolShell>
  );
}
