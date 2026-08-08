import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Up = 2 | 4 | 6 | 9;
const GRID: Record<Up, [number, number]> = { 2: [2, 1], 4: [2, 2], 6: [3, 2], 9: [3, 3] };
const SHEET: Record<"A4" | "Letter", [number, number]> = { A4: [595.28, 841.89], Letter: [612, 792] };

export function PdfNupTool() {
  const tool = tools.find((t) => t.slug === "pdf-nup")!;
  const [files, setFiles] = useState<File[]>([]);
  const [up, setUp] = useState<Up>(2);
  const [sheet, setSheet] = useState<"A4" | "Letter">("A4");
  const [landscape, setLandscape] = useState(true);
  const [gap, setGap] = useState(12);
  const [border, setBorder] = useState(true);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const run = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Reading PDF…", progress: 8 });
      const { PDFDocument, rgb } = await import("pdf-lib");
      const src = await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()), {
        ignoreEncryption: true,
      });
      const out = await PDFDocument.create();

      const [cols, rows] = GRID[up];
      const [sw, sh] = SHEET[sheet];
      const pageW = landscape ? sh : sw;
      const pageH = landscape ? sw : sh;
      const margin = 18;
      const cellW = (pageW - margin * 2 - gap * (cols - 1)) / cols;
      const cellH = (pageH - margin * 2 - gap * (rows - 1)) / rows;

      const indices = src.getPageIndices();
      const embedded = await out.embedPages(indices.map((i) => src.getPage(i)));

      for (let i = 0; i < embedded.length; i += up) {
        setStatus({
          kind: "working",
          message: `Placing pages ${i + 1}–${Math.min(i + up, embedded.length)}…`,
          progress: 10 + (i / embedded.length) * 85,
        });
        const page = out.addPage([pageW, pageH]);
        for (let s = 0; s < up && i + s < embedded.length; s++) {
          const ep = embedded[i + s];
          const col = s % cols;
          const row = Math.floor(s / cols);
          const cellX = margin + col * (cellW + gap);
          const cellY = pageH - margin - (row + 1) * cellH - row * gap;
          const scale = Math.min(cellW / ep.width, cellH / ep.height);
          const w = ep.width * scale;
          const h = ep.height * scale;
          page.drawPage(ep, {
            x: cellX + (cellW - w) / 2,
            y: cellY + (cellH - h) / 2,
            width: w,
            height: h,
          });
          if (border) {
            page.drawRectangle({
              x: cellX,
              y: cellY,
              width: cellW,
              height: cellH,
              borderColor: rgb(0.8, 0.8, 0.78),
              borderWidth: 0.5,
            });
          }
        }
      }

      const bytes = await out.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      downloadBlob(blob, files[0].name.replace(/\.pdf$/i, "") + `-${up}up.pdf`);
      setStatus({ kind: "success", message: `Done — ${Math.ceil(embedded.length / up)} sheet(s).` });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Could not lay out that PDF." });
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
        "Drop in a PDF — it stays on your device.",
        "Choose how many pages go on each sheet (2, 4, 6 or 9) and the paper size.",
        "Download the combined PDF, ready to print and save paper.",
      ]}
    >
      <Dropzone accept="application/pdf" multiple={false} onFiles={(f) => setFiles(f.slice(0, 1))} hint="One PDF file" />
      <FileList files={files} onRemove={() => setFiles([])} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Pages per sheet</span>
        {([2, 4, 6, 9] as Up[]).map((u) => (
          <button key={u} type="button" onClick={() => setUp(u)} className={chip(up === u)}>
            {u}-up
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Paper</span>
        {(["A4", "Letter"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setSheet(s)} className={chip(sheet === s)}>
            {s}
          </button>
        ))}
        <button type="button" onClick={() => setLandscape((v) => !v)} className={chip(landscape)}>
          Landscape
        </button>
        <button type="button" onClick={() => setBorder((v) => !v)} className={chip(border)}>
          Cell borders
        </button>
      </div>

      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Gap · {gap}pt</span>
        <input
          type="range"
          min={0}
          max={40}
          value={gap}
          onChange={(e) => setGap(Number(e.target.value))}
          className="mt-2 w-full accent-[hsl(var(--signal,0_0%_0%))]"
        />
      </label>

      <PrimaryButton onClick={run} disabled={files.length === 0} loading={status.kind === "working"}>
        Build {up}-up PDF
      </PrimaryButton>
    </ToolShell>
  );
}