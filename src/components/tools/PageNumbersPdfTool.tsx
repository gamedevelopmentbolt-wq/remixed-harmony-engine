import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Position = "bl" | "bc" | "br" | "tl" | "tc" | "tr";
type Fmt = "n" | "page-n" | "n-of-total";

export function PageNumbersPdfTool() {
  const tool = tools.find((t) => t.slug === "page-numbers-pdf")!;
  const [pdf, setPdf] = useState<File | null>(null);
  const [start, setStart] = useState(1);
  const [position, setPosition] = useState<Position>("bc");
  const [fmt, setFmt] = useState<Fmt>("n");
  const [size, setSize] = useState(12);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const run = async () => {
    if (!pdf) return;
    try {
      setStatus({ kind: "working", message: "Loading PDF…", progress: 10 });
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.load(new Uint8Array(await pdf.arrayBuffer()), { ignoreEncryption: true });
      const pages = doc.getPages();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const total = pages.length;

      for (let i = 0; i < total; i++) {
        const p = pages[i];
        const { width, height } = p.getSize();
        const n = start + i;
        const label = fmt === "n" ? `${n}` : fmt === "page-n" ? `Page ${n}` : `${n} of ${total + start - 1}`;
        const tw = font.widthOfTextAtSize(label, size);
        const th = size;
        const margin = 24;
        let x = width / 2 - tw / 2;
        let y = margin;
        if (position.endsWith("l")) x = margin;
        else if (position.endsWith("r")) x = width - margin - tw;
        if (position.startsWith("t")) y = height - margin - th;
        p.drawText(label, { x, y, size, font, color: rgb(0.15, 0.15, 0.15) });
        setStatus({ kind: "working", message: `Numbering page ${i + 1}/${total}…`, progress: 10 + (i / total) * 85 });
      }

      const out = await doc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), pdf.name.replace(/\.pdf$/i, "") + "-numbered.pdf");
      setStatus({ kind: "success", message: `Numbered ${total} pages.` });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not number this PDF. (" + detail + ")" });
    }
  };

  const positions: { key: Position; label: string }[] = [
    { key: "tl", label: "Top left" }, { key: "tc", label: "Top center" }, { key: "tr", label: "Top right" },
    { key: "bl", label: "Bottom left" }, { key: "bc", label: "Bottom center" }, { key: "br", label: "Bottom right" },
  ];

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF file.",
        "Choose position, starting number, format and size.",
        "Numbers are drawn on every page and the new PDF is saved locally.",
      ]}
    >
      {!pdf ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={(fs) => setPdf(fs[0] ?? null)} hint="One PDF file" />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-ink">{pdf.name}</p>
          <button type="button" onClick={() => setPdf(null)} className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink">
            Choose another
          </button>
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Position</legend>
        <div className="grid grid-cols-3 gap-2">
          {positions.map((p) => (
            <label
              key={p.key}
              className={"cursor-pointer rounded-xl border p-2 text-center text-xs transition " + (position === p.key ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}
            >
              <input type="radio" name="pos" value={p.key} checked={position === p.key} onChange={() => setPosition(p.key)} className="sr-only" />
              <span className="font-mono uppercase tracking-wider">{p.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Format</legend>
        <div className="grid grid-cols-3 gap-2">
          {([
            { k: "n", label: "1" },
            { k: "page-n", label: "Page 1" },
            { k: "n-of-total", label: "1 of N" },
          ] as { k: Fmt; label: string }[]).map((f) => (
            <label
              key={f.k}
              className={"cursor-pointer rounded-xl border p-2 text-center text-sm transition " + (fmt === f.k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}
            >
              <input type="radio" name="fmt" value={f.k} checked={fmt === f.k} onChange={() => setFmt(f.k)} className="sr-only" />
              <span className="font-mono text-xs">{f.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Starting number</span>
          <input type="number" min={0} value={start} onChange={(e) => setStart(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm text-ink" />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Font size ({size}pt)</span>
          <input type="range" min={8} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-1 block w-full" />
        </label>
      </div>

      <PrimaryButton onClick={run} disabled={!pdf || status.kind === "working"}>
        Add page numbers
      </PrimaryButton>
    </ToolShell>
  );
}
