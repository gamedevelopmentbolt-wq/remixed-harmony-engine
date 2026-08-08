import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Mode = "pdf-to-word" | "word-to-pdf";

export function PdfWordTool() {
  const tool = tools.find((t) => t.slug === "pdf-word")!;
  const [mode, setMode] = useState<Mode>("pdf-to-word");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const clear = () => {
    setFiles([]);
    setStatus({ kind: "idle" });
  };

  const onFiles = (fs: File[]) => {
    const wanted =
      mode === "pdf-to-word"
        ? fs.filter((f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name))
        : fs.filter((f) => /\.docx$/i.test(f.name));
    if (wanted.length === 0) {
      setStatus({
        kind: "error",
        message: mode === "pdf-to-word" ? "Please choose a PDF file." : "Please choose a .docx file.",
      });
      return;
    }
    setFiles([wanted[0]]);
    setStatus({ kind: "idle" });
  };

  const pdfToWord = async () => {
    const file = files[0];
    setStatus({ kind: "working", message: "Reading PDF…", progress: 5 });
    const { loadPdfjs } = await import("@/lib/pdfjs-loader");
    const pdfjs = await loadPdfjs();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    // Runs are grouped by baseline (paragraph line); each run carries formatting flags.
    type Run = { text: string; sub?: boolean; sup?: boolean; math?: boolean };
    const paragraphs: Run[][] = [];
    // Regex to detect math-heavy runs: math symbols, Greek letters, operators.
    const mathRe = /[∑∏∫∂∇√∞≈≤≥≠≡≅∈∉∋⊂⊃⊆⊇∪∩∅∀∃±×÷·∘∧∨¬←→↔⇐⇒⇔αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ]/;
    for (let i = 1; i <= doc.numPages; i++) {
      setStatus({ kind: "working", message: `Reading page ${i} of ${doc.numPages}…`, progress: 10 + (i / doc.numPages) * 70 });
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const items = content.items as Array<{ str: string; transform: number[]; height?: number }>;
      // Determine dominant font height on the page for sub/super detection.
      const heights = items.map((it) => Math.abs(it.transform[3]) || it.height || 0).filter((h) => h > 0);
      const median = heights.slice().sort((a, b) => a - b)[Math.floor(heights.length / 2)] || 10;
      let line: Run[] = [];
      let lastY: number | null = null;
      for (const it of items) {
        if (!it.str) continue;
        const y = it.transform[5];
        const h = Math.abs(it.transform[3]) || it.height || median;
        if (lastY !== null && Math.abs(y - lastY) > median * 0.6) {
          if (line.length) paragraphs.push(line);
          line = [];
        }
        // sub/superscript heuristic: smaller than median AND baseline shift.
        const smaller = h < median * 0.82 && h > 0;
        const shift = lastY !== null ? y - lastY : 0;
        const sub = smaller && shift < -0.3;
        const sup = smaller && shift > 0.3;
        const math = mathRe.test(it.str);
        line.push({ text: it.str + " ", sub, sup, math });
        lastY = y;
      }
      if (line.length) paragraphs.push(line);
      paragraphs.push([]);
    }
    setStatus({ kind: "working", message: "Building .docx…", progress: 90 });
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const docx = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs.map(
            (runs) =>
              new Paragraph({
                children:
                  runs.length === 0
                    ? [new TextRun("")]
                    : runs.map(
                        (r) =>
                          new TextRun({
                            text: r.text,
                            subScript: r.sub,
                            superScript: r.sup && !r.sub,
                            font: r.math ? "Cambria Math" : undefined,
                            italics: r.math || undefined,
                          }),
                      ),
              }),
          ),
        },
      ],
    });
    const blob = await Packer.toBlob(docx);
    downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + ".docx");
    setStatus({
      kind: "success",
      message: "Downloaded .docx. Sub/superscripts and math symbols (α, ∑, √, ≤ …) preserved; complex 2D formulas may still simplify.",
    });
  };

  const wordToPdf = async () => {
    const file = files[0];
    setStatus({ kind: "working", message: "Reading .docx…", progress: 10 });
    const mammoth = await import("mammoth");
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    setStatus({ kind: "working", message: "Rendering PDF…", progress: 60 });
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const container = document.createElement("div");
    container.style.width = "500px";
    container.style.fontFamily = "Helvetica, Arial, sans-serif";
    container.style.fontSize = "12px";
    container.style.color = "#111";
    container.innerHTML = html;
    document.body.appendChild(container);
    try {
      await pdf.html(container, {
        callback: (d) => d.save(file.name.replace(/\.docx$/i, "") + ".pdf"),
        margin: [40, 40, 40, 40],
        autoPaging: "text",
        width: 515,
        windowWidth: 500,
      });
    } finally {
      container.remove();
    }
    setStatus({ kind: "success", message: "Downloaded .pdf. Basic formatting preserved; complex tables may reflow." });
  };

  const run = async () => {
    if (files.length === 0) return;
    try {
      if (mode === "pdf-to-word") await pdfToWord();
      else await wordToPdf();
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Conversion failed. The file may be encrypted, scanned or unsupported." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Pick a direction — PDF to Word or Word to PDF.",
        "Text and paragraphs are extracted in your browser and rebuilt in the target format.",
        "Download the converted document. Basic formatting is preserved; complex layouts may simplify.",
      ]}
    >
      <div className="flex flex-wrap gap-2">
        {(["pdf-to-word", "word-to-pdf"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              clear();
            }}
            aria-pressed={mode === m}
            className={
              "inline-flex h-9 items-center rounded-full border px-4 font-mono text-[11px] uppercase tracking-wider transition " +
              (mode === m
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white text-graphite/80 hover:border-ink/60 hover:text-ink")
            }
          >
            {m === "pdf-to-word" ? "PDF → Word" : "Word → PDF"}
          </button>
        ))}
      </div>
      {files.length === 0 ? (
        <Dropzone
          accept={mode === "pdf-to-word" ? "application/pdf,.pdf" : ".docx"}
          multiple={false}
          onFiles={onFiles}
          hint={mode === "pdf-to-word" ? "One PDF file" : "One .docx file (Word 2007+)"}
        />
      ) : (
        <FileList files={files} onRemove={() => setFiles([])} />
      )}
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run} disabled={files.length === 0 || status.kind === "working"}>
          Convert
        </PrimaryButton>
        {files.length > 0 && (
          <GhostButton type="button" onClick={clear}>
            Reset
          </GhostButton>
        )}
      </div>
    </ToolShell>
  );
}
