import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, readFileAsText } from "@/lib/tool-utils";

const SAMPLE = `Invoice,Client,Date,Amount
INV-0001,Northwind Ltd,2026-06-02,1240.00
INV-0002,Acme Studio,2026-06-11,480.50
INV-0003,Blue Harbour,2026-06-19,2100.00`;

/** Minimal RFC4180-ish parser: handles quotes, escaped quotes and embedded newlines. */
function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === delim) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function CsvToPdfTool() {
  const tool = tools.find((t) => t.slug === "csv-to-pdf")!;
  const [text, setText] = useState(SAMPLE);
  const [name, setName] = useState("table");
  const [delim, setDelim] = useState<"," | ";" | "\t">(",");
  const [title, setTitle] = useState("");
  const [landscape, setLandscape] = useState(false);
  const [header, setHeader] = useState(true);
  const [zebra, setZebra] = useState(true);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = async (fs: File[]) => {
    if (fs.length === 0) return;
    setName(fs[0].name.replace(/\.[^.]+$/, "") || "table");
    setText(await readFileAsText(fs[0]));
  };

  const rows = parseCsv(text, delim);

  const run = async () => {
    if (rows.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Rendering table…", progress: 20 });
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4", orientation: landscape ? "landscape" : "portrait" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 36;
      let y = M;

      if (title.trim()) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(title, M, y + 6);
        y += 28;
      }

      const cols = Math.max(...rows.map((r) => r.length));
      const colW = (W - M * 2) / cols;
      const lineH = 14;
      doc.setFontSize(9);

      const drawRow = (cells: string[], index: number) => {
        const wrapped = Array.from({ length: cols }, (_, c) =>
          doc.splitTextToSize(cells[c] ?? "", colW - 10) as string[],
        );
        const rowH = Math.max(...wrapped.map((w) => w.length)) * lineH + 8;
        if (y + rowH > H - M) {
          doc.addPage();
          y = M;
        }
        const isHeader = header && index === 0;
        if (isHeader) {
          doc.setFillColor(28, 28, 26);
          doc.rect(M, y, W - M * 2, rowH, "F");
          doc.setTextColor(255);
          doc.setFont("helvetica", "bold");
        } else {
          if (zebra && index % 2 === 0) {
            doc.setFillColor(246, 246, 244);
            doc.rect(M, y, W - M * 2, rowH, "F");
          }
          doc.setTextColor(30);
          doc.setFont("helvetica", "normal");
        }
        wrapped.forEach((lines, c) => {
          lines.forEach((l, li) => doc.text(l, M + c * colW + 5, y + 14 + li * lineH));
        });
        doc.setDrawColor(220);
        doc.rect(M, y, W - M * 2, rowH);
        y += rowH;
      };

      rows.forEach(drawRow);
      doc.setTextColor(0);

      const blob = doc.output("blob");
      downloadBlob(blob, `${name || "table"}.pdf`);
      setStatus({ kind: "success", message: `PDF ready — ${rows.length} row(s).` });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Could not convert that CSV." });
    }
  };

  const chip = (active: boolean) =>
    "inline-flex h-9 items-center rounded-md border px-3 font-mono text-xs uppercase tracking-wider " +
    (active ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink");

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a .csv file or paste the rows straight into the box.",
        "Pick the separator and choose whether the first row is a header.",
        "Download a tidy, paginated PDF table — converted entirely in your browser.",
      ]}
    >
      <Dropzone accept=".csv,text/csv,text/plain" multiple={false} onFiles={onFiles} hint="A .csv or .txt file" />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        spellCheck={false}
        className="w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-ink outline-none focus:border-ink"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Separator</span>
        <button type="button" onClick={() => setDelim(",")} className={chip(delim === ",")}>Comma</button>
        <button type="button" onClick={() => setDelim(";")} className={chip(delim === ";")}>Semicolon</button>
        <button type="button" onClick={() => setDelim("\t")} className={chip(delim === "\t")}>Tab</button>
        <button type="button" onClick={() => setHeader((v) => !v)} className={chip(header)}>Header row</button>
        <button type="button" onClick={() => setZebra((v) => !v)} className={chip(zebra)}>Striped rows</button>
        <button type="button" onClick={() => setLandscape((v) => !v)} className={chip(landscape)}>Landscape</button>
      </div>

      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Title (optional)</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q2 invoices"
          className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-mono text-sm text-ink outline-none focus:border-ink"
        />
      </label>

      <p className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">
        {rows.length} row(s) · {rows.length ? Math.max(...rows.map((r) => r.length)) : 0} column(s)
      </p>

      <PrimaryButton onClick={run} disabled={rows.length === 0} loading={status.kind === "working"}>
        Convert to PDF
      </PrimaryButton>
    </ToolShell>
  );
}