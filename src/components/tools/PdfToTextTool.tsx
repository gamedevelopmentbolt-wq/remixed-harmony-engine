import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { loadPdfjs } from "@/lib/pdfjs-loader";
import { downloadBlob } from "@/lib/tool-utils";

export function PdfToTextTool() {
  const tool = tools.find((t) => t.slug === "pdf-to-text")!;
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  async function extract() {
    if (!file) return;
    setStatus({ kind: "working", message: "Reading PDF…", progress: 5 });
    try {
      const pdfjs = await loadPdfjs();
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      let out = "";
      for (let i = 1; i <= doc.numPages; i++) {
        setStatus({ kind: "working", message: `Extracting page ${i} of ${doc.numPages}…`, progress: (i / doc.numPages) * 100 });
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const line = content.items.map((it: any) => it.str).join(" ");
        out += line + "\n\n";
      }
      setText(out.trim());
      setStatus({ kind: "success", message: `Extracted text from ${doc.numPages} page(s).` });
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? "Failed to read PDF." });
    }
  }

  function download() {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, (file?.name ?? "document").replace(/\.pdf$/i, "") + ".txt");
  }

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF that already contains real (selectable) text.",
        "The tool reads every page in your browser using PDF.js — nothing is uploaded.",
        "Copy the extracted text or download it as a plain .txt file.",
      ]}
    >
      <Dropzone accept="application/pdf" multiple={false} onFiles={(fs) => { setFile(fs[0]); setText(""); }} />
      {file && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-white p-3">
          <p className="font-mono text-sm text-ink">{file.name}</p>
          <PrimaryButton onClick={extract} loading={status.kind === "working"}>Extract text</PrimaryButton>
        </div>
      )}
      {text && (
        <>
          <textarea readOnly value={text} rows={16} className="block w-full rounded-md border border-line bg-white p-3 text-sm font-mono text-graphite" />
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={download}>Download .txt</PrimaryButton>
            <button type="button" onClick={() => navigator.clipboard.writeText(text)} className="inline-flex h-11 items-center rounded-md border border-ink bg-white px-5 font-mono text-sm font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper">Copy</button>
          </div>
        </>
      )}
    </ToolShell>
  );
}
