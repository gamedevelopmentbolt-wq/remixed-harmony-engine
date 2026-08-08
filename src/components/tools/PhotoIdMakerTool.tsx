import { useEffect, useMemo, useRef, useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

type Preset = { key: string; label: string; wMm: number; hMm: number };
const PRESETS: Preset[] = [
  { key: "nadra", label: "NADRA CNIC (35 × 45 mm)", wMm: 35, hMm: 45 },
  { key: "pk-passport", label: "Pakistan Passport (35 × 45 mm)", wMm: 35, hMm: 45 },
  { key: "uk-visa", label: "UK Visa (35 × 45 mm)", wMm: 35, hMm: 45 },
  { key: "us-visa", label: "US Visa (51 × 51 mm, 2×2 in)", wMm: 51, hMm: 51 },
];
const DPI = 300;
const mmToPx = (mm: number) => Math.round((mm / 25.4) * DPI);

export function PhotoIdMakerTool() {
  const tool = tools.find((t) => t.slug === "photo-id-maker")!;
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [removeBg, setRemoveBg] = useState(false);
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const target = useMemo(() => ({ w: mmToPx(preset.wMm), h: mmToPx(preset.hMm) }), [preset]);

  useEffect(() => {
    (async () => {
      if (!dataUrl) return;
      try {
        setStatus({ kind: "working", message: removeBg ? "Removing background…" : "Rendering preview…" });
        let img = await loadImage(dataUrl);
        if (removeBg) {
          const { removeBackground } = await import("@imgly/background-removal");
          const blob = await removeBackground(dataUrl);
          const url = URL.createObjectURL(blob);
          img = await loadImage(url);
          setTimeout(() => URL.revokeObjectURL(url), 500);
        }
        const c = canvasRef.current!;
        c.width = target.w; c.height = target.h;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        // cover fit
        const srcR = img.width / img.height;
        const tgtR = c.width / c.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcR > tgtR) { sw = img.height * tgtR; sx = (img.width - sw) / 2; }
        else { sh = img.width / tgtR; sy = (img.height - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        setStatus({ kind: "idle" });
      } catch (e) {
        console.error(e);
        setStatus({ kind: "error", message: "Couldn't process this image. Try a JPG or PNG under 20MB." });
      }
    })();
  }, [dataUrl, preset, removeBg, target.w, target.h]);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setDataUrl(await readFileAsDataURL(f));
  };

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    const mime = format === "jpg" ? "image/jpeg" : "image/png";
    c.toBlob((b) => {
      if (!b) return;
      downloadBlob(b, `id-photo-${preset.key}-${preset.wMm}x${preset.hMm}mm.${format}`);
      setStatus({ kind: "success", message: "Saved. Print at 300 DPI for accurate size." });
    }, mime, 0.95);
  };

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Upload a clear front-facing photo (JPG or PNG).",
      "Pick your document type — NADRA CNIC, Pakistan passport, UK or US visa.",
      "Optional: remove the background for a clean white studio look, then download JPG or PNG at 300 DPI.",
    ]}>
      {!file && <Dropzone accept="image/*" multiple={false} onFiles={onFiles} hint="Front-facing, well-lit, plain background works best" />}

      {file && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {PRESETS.map((p) => (
              <label key={p.key} className={"cursor-pointer rounded-xl border p-3 " + (preset.key === p.key ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink/60")}>
                <input type="radio" name="preset" className="sr-only" checked={preset.key === p.key} onChange={() => setPreset(p)} />
                <p className="font-mono text-sm font-bold">{p.label}</p>
                <p className={"mt-1 font-mono text-[10px] uppercase tracking-widest " + (preset.key === p.key ? "text-paper/70" : "text-graphite/60")}>{mmToPx(p.wMm)} × {mmToPx(p.hMm)} px @ 300 DPI</p>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} /> Remove background (white)
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              Format:
              <select value={format} onChange={(e) => setFormat(e.target.value as "jpg" | "png")} className="rounded border border-line bg-white p-1 font-mono text-sm">
                <option value="jpg">JPG</option><option value="png">PNG</option>
              </select>
            </label>
            <button type="button" onClick={() => { setFile(null); setDataUrl(null); }} className="ml-auto font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">Change photo</button>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-paper-2/50 p-6">
            <canvas ref={canvasRef} className="max-h-[420px] w-auto rounded border border-line bg-white" style={{ aspectRatio: `${target.w}/${target.h}` }} />
            <p className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">{target.w} × {target.h} px · {preset.wMm} × {preset.hMm} mm</p>
            <PrimaryButton onClick={download}>Download {format.toUpperCase()}</PrimaryButton>
          </div>
        </div>
      )}
    </ToolShell>
  );
}