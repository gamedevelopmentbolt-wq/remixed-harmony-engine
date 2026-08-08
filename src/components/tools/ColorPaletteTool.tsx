import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { loadImage, readFileAsDataURL, downloadBlob } from "@/lib/tool-utils";

interface Swatch {
  hex: string;
  r: number;
  g: number;
  b: number;
  share: number; // 0-1
}

function toHex(n: number) {
  return n.toString(16).padStart(2, "0");
}

// Median-cut quantization
function medianCut(pixels: Uint8ClampedArray, depth: number): Swatch[] {
  interface Bucket { pts: number[][]; }
  const initial: Bucket = { pts: [] };
  const total = pixels.length / 4;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 125) continue; // skip transparent
    initial.pts.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }
  if (initial.pts.length === 0) return [];
  let buckets: Bucket[] = [initial];
  for (let d = 0; d < depth; d++) {
    const next: Bucket[] = [];
    for (const b of buckets) {
      if (b.pts.length < 2) {
        next.push(b);
        continue;
      }
      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      for (const p of b.pts) {
        if (p[0] < minR) minR = p[0]; if (p[0] > maxR) maxR = p[0];
        if (p[1] < minG) minG = p[1]; if (p[1] > maxG) maxG = p[1];
        if (p[2] < minB) minB = p[2]; if (p[2] > maxB) maxB = p[2];
      }
      const rangeR = maxR - minR, rangeG = maxG - minG, rangeB = maxB - minB;
      const ch = rangeR >= rangeG && rangeR >= rangeB ? 0 : rangeG >= rangeB ? 1 : 2;
      b.pts.sort((a, c) => a[ch] - c[ch]);
      const mid = Math.floor(b.pts.length / 2);
      next.push({ pts: b.pts.slice(0, mid) }, { pts: b.pts.slice(mid) });
    }
    buckets = next;
  }
  return buckets
    .filter((b) => b.pts.length > 0)
    .map((b) => {
      let r = 0, g = 0, bb = 0;
      for (const p of b.pts) { r += p[0]; g += p[1]; bb += p[2]; }
      const n = b.pts.length;
      const rr = Math.round(r / n), gg = Math.round(g / n), bbb = Math.round(bb / n);
      return { r: rr, g: gg, b: bbb, hex: "#" + toHex(rr) + toHex(gg) + toHex(bbb), share: n / total };
    })
    .sort((a, b) => b.share - a.share);
}

export function ColorPaletteTool() {
  const tool = tools.find((t) => t.slug === "color-palette")!;
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string>("");
  const [count, setCount] = useState(6);
  const [palette, setPalette] = useState<Swatch[]>([]);
  const [copied, setCopied] = useState<string>("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const pick = async (fs: File[]) => {
    const f = fs[0];
    if (!f) return;
    setFile(f);
    setPalette([]);
    setSrc(await readFileAsDataURL(f));
  };

  const run = async () => {
    if (!src) return;
    try {
      setStatus({ kind: "working", message: "Sampling pixels…", progress: 30 });
      const img = await loadImage(src);
      const maxDim = 200;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      setStatus({ kind: "working", message: "Extracting colors…", progress: 70 });
      const depth = Math.ceil(Math.log2(count));
      const result = medianCut(data, depth).slice(0, count);
      setPalette(result);
      setStatus({ kind: "success", message: `Extracted ${result.length} colors.` });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not read this image." });
    }
  };

  const copy = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(""), 1200);
  };

  const downloadPaletteCss = () => {
    if (palette.length === 0) return;
    const css = `:root {\n${palette.map((s, i) => `  --color-${i + 1}: ${s.hex}; /* ${Math.round(s.share * 100)}% */`).join("\n")}\n}\n`;
    downloadBlob(new Blob([css], { type: "text/css" }), "palette.css");
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a JPG, PNG or WEBP image.",
        "Choose how many colors you want and extract the palette.",
        "Click any swatch to copy its hex code, or download the palette as CSS variables.",
      ]}
    >
      {!file ? (
        <Dropzone accept="image/*" multiple={false} onFiles={pick} hint="JPG, PNG or WEBP" />
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-3">
          {src && <img src={src} alt="" className="h-16 w-16 rounded object-cover" />}
          <p className="min-w-0 flex-1 truncate font-mono text-sm text-ink">{file.name}</p>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setSrc("");
              setPalette([]);
            }}
            className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
          >
            Choose another
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Colors ({count})</span>
          <input type="range" min={3} max={12} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-1 block w-full" />
        </label>
      </div>

      <PrimaryButton onClick={run} disabled={!file || status.kind === "working"}>
        Extract palette
      </PrimaryButton>

      {palette.length > 0 && (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {palette.map((s) => (
              <li key={s.hex} className="overflow-hidden rounded-xl border border-line bg-white">
                <button type="button" onClick={() => copy(s.hex)} className="block h-24 w-full" style={{ background: s.hex }} aria-label={`Copy ${s.hex}`} />
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="font-mono text-sm font-bold uppercase text-ink">{s.hex}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                      rgb({s.r},{s.g},{s.b}) · {Math.round(s.share * 100)}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(s.hex)}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink"
                  >
                    {copied === s.hex ? <Check className="h-3.5 w-3.5 text-workshop" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === s.hex ? "Copied" : "Copy"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={downloadPaletteCss}
            className="inline-flex h-10 items-center rounded-md border border-ink bg-white px-4 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
          >
            Download palette.css
          </button>
        </>
      )}
    </ToolShell>
  );
}
