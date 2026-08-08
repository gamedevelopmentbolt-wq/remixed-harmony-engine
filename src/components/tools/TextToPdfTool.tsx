import { useState } from "react";
import { PrimaryButton, GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, readFileAsText } from "@/lib/tool-utils";

const SAMPLE = `# Weekly Notes

**Goal:** ship the new tools this week.

## Highlights

- Barcode generator with SVG output
- Watermark PDF (text + image)
- Text/Markdown to PDF (this one!)

## Next steps

1. Ship the batch
2. Verify each button renders
3. Publish

> Everything runs client-side — nothing leaves your browser.
`;

interface Block {
  type: "h1" | "h2" | "h3" | "p" | "li" | "quote" | "hr" | "code";
  text: string;
  bold?: boolean;
}

function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: Block[] = [];
  let inCode = false;
  for (const raw of lines) {
    const line = raw;
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      out.push({ type: "code", text: line });
      continue;
    }
    if (/^\s*$/.test(line)) {
      out.push({ type: "p", text: "" });
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      out.push({ type: "hr", text: "" });
      continue;
    }
    let m = /^###\s+(.*)$/.exec(line);
    if (m) { out.push({ type: "h3", text: m[1] }); continue; }
    m = /^##\s+(.*)$/.exec(line);
    if (m) { out.push({ type: "h2", text: m[1] }); continue; }
    m = /^#\s+(.*)$/.exec(line);
    if (m) { out.push({ type: "h1", text: m[1] }); continue; }
    m = /^>\s?(.*)$/.exec(line);
    if (m) { out.push({ type: "quote", text: m[1] }); continue; }
    m = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(line);
    if (m) { out.push({ type: "li", text: m[3] }); continue; }
    out.push({ type: "p", text: line });
  }
  return out;
}

export function TextToPdfTool() {
  const tool = tools.find((t) => t.slug === "text-to-pdf")!;
  const [content, setContent] = useState<string>(SAMPLE);
  const [title, setTitle] = useState<string>("document");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFile = async (fs: FileList | null) => {
    if (!fs || fs.length === 0) return;
    const f = fs[0];
    setTitle(f.name.replace(/\.[^.]+$/, "") || "document");
    const text = await readFileAsText(f);
    setContent(text);
  };

  const drawInline = (
    pdf: import("jspdf").jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    baseSize: number,
    baseStyle: "normal" | "bold" = "normal",
  ): number => {
    // Handle **bold** and `code` inline by splitting into segments.
    type Seg = { text: string; bold: boolean; code: boolean };
    const segs: Seg[] = [];
    let i = 0;
    while (i < text.length) {
      if (text.startsWith("**", i)) {
        const end = text.indexOf("**", i + 2);
        if (end !== -1) {
          segs.push({ text: text.slice(i + 2, end), bold: true, code: false });
          i = end + 2;
          continue;
        }
      }
      if (text[i] === "`") {
        const end = text.indexOf("`", i + 1);
        if (end !== -1) {
          segs.push({ text: text.slice(i + 1, end), bold: false, code: true });
          i = end + 1;
          continue;
        }
      }
      // accumulate plain until next marker
      let j = i;
      while (j < text.length && !text.startsWith("**", j) && text[j] !== "`") j++;
      segs.push({ text: text.slice(i, j), bold: baseStyle === "bold", code: false });
      i = j;
    }

    // word-wrap across segments
    let cursorX = x;
    let cursorY = y;
    for (const seg of segs) {
      pdf.setFont(seg.code ? "Courier" : "Helvetica", seg.bold ? "bold" : "normal");
      pdf.setFontSize(baseSize);
      const words = seg.text.split(/(\s+)/);
      for (const w of words) {
        if (!w) continue;
        const wWidth = pdf.getTextWidth(w);
        if (cursorX - x + wWidth > maxWidth && w.trim() !== "") {
          cursorY += lineHeight;
          cursorX = x;
        }
        pdf.text(w, cursorX, cursorY);
        cursorX += wWidth;
      }
    }
    return cursorY + lineHeight;
  };

  const run = async () => {
    try {
      setStatus({ kind: "working", message: "Rendering PDF…", progress: 20 });
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "pt", format: "letter" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 56;
      const maxW = pageW - margin * 2;
      let y = margin;

      const blocks = parseMarkdown(content);
      for (const b of blocks) {
        let size = 11;
        let lh = 16;
        let style: "normal" | "bold" = "normal";
        let indent = 0;
        let prefix = "";
        if (b.type === "h1") { size = 22; lh = 28; style = "bold"; y += 6; }
        else if (b.type === "h2") { size = 17; lh = 22; style = "bold"; y += 4; }
        else if (b.type === "h3") { size = 14; lh = 19; style = "bold"; y += 2; }
        else if (b.type === "li") { indent = 16; prefix = "•  "; }
        else if (b.type === "quote") { indent = 12; }
        else if (b.type === "code") { size = 10; lh = 14; }

        if (b.type === "hr") {
          pdf.setDrawColor(200);
          pdf.line(margin, y, pageW - margin, y);
          y += 12;
          continue;
        }
        if (b.text === "" && b.type === "p") {
          y += 8;
          continue;
        }
        if (y > pageH - margin) {
          pdf.addPage();
          y = margin;
        }
        if (b.type === "quote") {
          pdf.setDrawColor(180);
          pdf.setLineWidth(2);
          pdf.line(margin, y - 10, margin, y + lh - 6);
        }
        if (b.type === "code") {
          pdf.setFont("Courier", "normal");
          pdf.setFontSize(size);
          pdf.setTextColor(60);
          pdf.text(b.text, margin + 4, y);
          pdf.setTextColor(20);
          y += lh;
          continue;
        }
        const line = prefix + b.text;
        y = drawInline(pdf, line, margin + indent, y, maxW - indent, lh, size, style);
        if (y > pageH - margin) {
          pdf.addPage();
          y = margin;
        }
      }

      setStatus({ kind: "working", message: "Saving…", progress: 90 });
      const blob = pdf.output("blob");
      downloadBlob(blob, (title || "document") + ".pdf");
      setStatus({ kind: "success", message: "PDF downloaded." });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not render this text. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste text or Markdown, or upload a .md / .txt file.",
        "Headings, bold, lists, quotes and inline code render with basic styling.",
        "Click Render and download a clean PDF — everything happens in your browser.",
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Filename</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm text-ink" />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Load from file</span>
          <input type="file" accept=".md,.markdown,.txt,text/*" onChange={(e) => onFile(e.target.files)} className="mt-1 block w-full font-mono text-xs text-ink" />
        </label>
      </div>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Content (Markdown or plain text)</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="mt-1 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run} disabled={!content.trim() || status.kind === "working"}>
          Render PDF
        </PrimaryButton>
        <GhostButton onClick={() => setContent(SAMPLE)}>Load sample</GhostButton>
      </div>
    </ToolShell>
  );
}
