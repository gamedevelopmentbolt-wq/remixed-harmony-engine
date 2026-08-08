import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

type Lang = "eng" | "urd" | "ara" | "eng+urd" | "eng+ara" | "eng+urd+ara";

export function PdfWordOcrTool() {
  const tool = tools.find((t) => t.slug === "pdf-word-ocr")!;
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState<Lang>("eng+urd+ara");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (files: File[]) => {
    const f = files.find((x) => x.name.toLowerCase().endsWith(".pdf"));
    if (f) setFile(f);
  };

  const isRTL = lang.includes("urd") || lang.includes("ara");

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading PDF…", progress: 2 });
      const pdfjs = await loadPdfjs();
      const buf = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buf }).promise;
      const Tesseract = (await import("tesseract.js")).default;
      const worker = await Tesseract.createWorker(lang);
      const paragraphs: string[][] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus({ kind: "working", message: `OCR page ${i} of ${pdf.numPages}…`, progress: (i / pdf.numPages) * 90 });
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 2 });
        const c = document.createElement("canvas");
        c.width = vp.width; c.height = vp.height;
        const ctx = c.getContext("2d")!;
        await page.render({ canvas: c, canvasContext: ctx, viewport: vp } as never).promise;
        const tc = await page.getTextContent();
        let text = tc.items.map((it) => (("str" in it && typeof it.str === "string") ? it.str : "")).join(" ").trim();
        if (text.length < 5) {
          const { data } = await worker.recognize(c);
          text = data.text;
        }
        paragraphs.push(text.split(/\n{2,}|\r{2,}/).map((s) => s.trim()).filter(Boolean));
      }
      await worker.terminate();

      setStatus({ kind: "working", message: "Building Word file…", progress: 95 });
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const children: import("docx").Paragraph[] = [];
      paragraphs.forEach((page, idx) => {
        page.forEach((p) =>
          children.push(new Paragraph({ bidirectional: isRTL, children: [new TextRun({ text: p, rightToLeft: isRTL })] })),
        );
        if (idx < paragraphs.length - 1) children.push(new Paragraph({ children: [new TextRun({ text: "", break: 1 })], pageBreakBefore: true }));
      });
      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + ".docx");
      setStatus({ kind: "success", message: "Done — .docx downloaded." });
    } catch (e) {
      console.error(e);
      setStatus({ kind: "error", message: (e as Error).message || "OCR failed. Try a smaller PDF." });
    }
  };

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Upload any PDF — scanned or digital, English, Urdu or Arabic.",
      "Pick your language pack (adds Urdu/Arabic OCR support alongside English).",
      "Click Convert — you get a .docx you can open in Microsoft Word or Google Docs.",
    ]}>
      {!file && <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="Scanned or digital PDFs" />}

      {file && (
        <div className="space-y-5">
          <div className="rounded-lg border border-line bg-paper-2/40 p-3 font-mono text-sm text-ink">{file.name}</div>
          <label className="block text-sm">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">OCR language</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm">
              <option value="eng+urd+ara">English + Urdu + Arabic</option>
              <option value="eng+urd">English + Urdu</option>
              <option value="eng+ara">English + Arabic</option>
              <option value="eng">English only</option>
              <option value="urd">Urdu only</option>
              <option value="ara">Arabic only</option>
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton onClick={run} loading={status.kind === "working"} loadingText={status.message ?? "Working…"}>Convert to Word</PrimaryButton>
            <button type="button" onClick={() => setFile(null)} className="font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">Change file</button>
          </div>
          <p className="text-xs text-graphite/70">Note: OCR downloads a small language model on first use (~10–15 MB). Everything else stays on your device.</p>
        </div>
      )}
    </ToolShell>
  );
}