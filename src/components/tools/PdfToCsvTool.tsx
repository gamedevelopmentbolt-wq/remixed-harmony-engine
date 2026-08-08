import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

interface Item { x: number; y: number; str: string; }

function itemsToRows(items: Item[], yTol = 3): string[][] {
  // Sort by y (descending in PDF coords, top-to-bottom), then x
  items.sort((a, b) => b.y - a.y);
  const rows: Item[][] = [];
  for (const it of items) {
    const row = rows.find((r) => Math.abs(r[0].y - it.y) < yTol);
    if (row) row.push(it);
    else rows.push([it]);
  }
  return rows.map((r) => r.sort((a, b) => a.x - b.x).map((c) => c.str));
}

function toCsv(rows: string[][]): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

export function PdfToCsvTool() {
  const tool = tools.find((t) => t.slug === "pdf-to-csv")!;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || x.name.toLowerCase().endsWith(".pdf"));
    if (!f) { setStatus({ kind: "error", message: "Please choose a PDF." }); return; }
    setFile(f);
    setStatus({ kind: "idle" });
  };

  const extract = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Reading PDF…", progress: 10 });
      const pdfjs = await loadPdfjs();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const allRows: string[][] = [];
      for (let p = 1; p <= doc.numPages; p++) {
        setStatus({ kind: "working", message: `Extracting page ${p} of ${doc.numPages}…`, progress: 10 + (p / doc.numPages) * 85 });
        const page = await doc.getPage(p);
        const text = await page.getTextContent();
        const items: Item[] = text.items
          .filter((it: any) => it.str && it.str.trim())
          .map((it: any) => ({ x: it.transform[4], y: it.transform[5], str: String(it.str).trim() }));
        if (items.length === 0) continue;
        const rows = itemsToRows(items);
        if (p > 1) allRows.push([]); // page separator
        allRows.push(...rows);
      }
      if (allRows.length === 0) throw new Error("No selectable text — is this a scanned PDF? Try the OCR tool first.");
      const csv = toCsv(allRows);
      const base = file.name.replace(/\.pdf$/i, "");
      downloadBlob(new Blob([csv], { type: "text/csv" }), `${base}.csv`);
      setStatus({ kind: "success", message: `Extracted ${allRows.length} row(s) from ${doc.numPages} page(s) → CSV downloaded.` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a text-based PDF containing tables — invoices, statements, reports.",
        "The tool groups text by vertical position, sorts left-to-right, and writes each row as a CSV line.",
        "Downloads as .csv, ready for Excel, Google Sheets or your data tool of choice.",
      ]}
    >
      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file with selectable text" />
      ) : (
        <>
          <FileList files={[file]} onRemove={() => setFile(null)} />
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={extract} disabled={status.kind === "working"}>Extract to CSV</PrimaryButton>
            <GhostButton onClick={() => setFile(null)}>Choose another</GhostButton>
          </div>
          <p className="font-mono text-xs text-graphite/70">
            Tip: heuristic row detection works best on clean, evenly-spaced tables. Complex multi-column reports may need light cleanup in a spreadsheet.
          </p>
        </>
      )}
    </ToolShell>
  );
}