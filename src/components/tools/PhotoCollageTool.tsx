import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

const PRESETS = [
  { key: "square", label: "Square 1:1", w: 1080, h: 1080 },
  { key: "story", label: "Story 9:16", w: 1080, h: 1920 },
  { key: "post", label: "Post 4:5", w: 1080, h: 1350 },
  { key: "wide", label: "Wide 16:9", w: 1920, h: 1080 },
] as const;

export function PhotoCollageTool() {
  const tool = tools.find((t) => t.slug === "photo-collage")!;
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState<(typeof PRESETS)[number]["key"]>("square");
  const [cols, setCols] = useState(2);
  const [gap, setGap] = useState(16);
  const [radius, setRadius] = useState(12);
  const [bg, setBg] = useState("#ffffff");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const add = (fs: File[]) => setFiles((p) => [...p, ...fs.filter((f) => f.type.startsWith("image/"))]);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    setFiles((prev) => {
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
  };

  const run = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Loading photos…", progress: 10 });
      const size = PRESETS.find((p) => p.key === preset)!;
      const rows = Math.ceil(files.length / cols);
      const canvas = document.createElement("canvas");
      canvas.width = size.w;
      canvas.height = size.h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cellW = (canvas.width - gap * (cols + 1)) / cols;
      const cellH = (canvas.height - gap * (rows + 1)) / rows;

      for (let i = 0; i < files.length; i++) {
        setStatus({ kind: "working", message: `Placing ${files[i].name}…`, progress: 15 + (i / files.length) * 80 });
        const img = await loadImage(await readFileAsDataURL(files[i]));
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = gap + col * (cellW + gap);
        const y = gap + row * (cellH + gap);

        // cover-crop the source into the cell
        const scale = Math.max(cellW / img.naturalWidth, cellH / img.naturalHeight);
        const sw = cellW / scale;
        const sh = cellH / scale;
        const sx = (img.naturalWidth - sw) / 2;
        const sy = (img.naturalHeight - sh) / 2;

        ctx.save();
        const r = Math.min(radius, cellW / 2, cellH / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + cellW, y, x + cellW, y + cellH, r);
        ctx.arcTo(x + cellW, y + cellH, x, y + cellH, r);
        ctx.arcTo(x, y + cellH, x, y, r);
        ctx.arcTo(x, y, x + cellW, y, r);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
        ctx.restore();
      }

      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not render the collage."))), "image/jpeg", 0.92),
      );
      downloadBlob(blob, `collage-${size.key}.jpg`);
      setStatus({ kind: "success", message: `Collage ready — ${size.w}×${size.h}px.` });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Could not build the collage." });
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
        "Add the photos you want in the grid and drag them into order.",
        "Pick a size preset, the number of columns, spacing and corner rounding.",
        "Download a single high-resolution JPG — all rendering happens in your browser.",
      ]}
    >
      <Dropzone accept="image/*" onFiles={add} hint="JPG, PNG, WEBP — several at once" />
      <FileList files={files} onRemove={(i) => setFiles((p) => p.filter((_, idx) => idx !== i))} onMove={move} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Size</span>
        {PRESETS.map((p) => (
          <button key={p.key} type="button" onClick={() => setPreset(p.key)} className={chip(preset === p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Columns · {cols}</span>
          <input type="range" min={1} max={5} value={cols} onChange={(e) => setCols(Number(e.target.value))} className="mt-2 w-full" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Gap · {gap}px</span>
          <input type="range" min={0} max={80} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="mt-2 w-full" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Corners · {radius}px</span>
          <input type="range" min={0} max={80} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="mt-2 w-full" />
        </label>
      </div>

      <label className="flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Background</span>
        <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-14 rounded-md border border-line bg-white" />
      </label>

      <PrimaryButton onClick={run} disabled={files.length === 0} loading={status.kind === "working"}>
        Build collage
      </PrimaryButton>
    </ToolShell>
  );
}