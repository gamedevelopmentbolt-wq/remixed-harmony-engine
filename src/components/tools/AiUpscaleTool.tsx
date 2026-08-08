import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { loadPipeline } from "@/lib/hf-transformers";
import { downloadBlob } from "@/lib/tool-utils";

interface RawImg { data: Uint8Array | Uint8ClampedArray; width: number; height: number; channels: number; toBlob?: (mime?: string) => Promise<Blob> }
type Upscaler = (input: string) => Promise<RawImg>;

const MAX_INPUT = 512; // px — Swin2SR is slow beyond this

async function shrinkIfNeeded(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  if (bmp.width <= MAX_INPUT && bmp.height <= MAX_INPUT) return URL.createObjectURL(file);
  const scale = MAX_INPUT / Math.max(bmp.width, bmp.height);
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, w, h);
  const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
  return URL.createObjectURL(blob);
}

function rawToCanvas(img: RawImg): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext("2d")!;
  const out = ctx.createImageData(img.width, img.height);
  const src = img.data;
  const ch = img.channels;
  for (let i = 0, j = 0; i < src.length; i += ch, j += 4) {
    out.data[j] = src[i];
    out.data[j + 1] = ch > 1 ? src[i + 1] : src[i];
    out.data[j + 2] = ch > 2 ? src[i + 2] : src[i];
    out.data[j + 3] = ch > 3 ? src[i + 3] : 255;
  }
  ctx.putImageData(out, 0, 0);
  return c;
}

export function AiUpscaleTool() {
  const tool = tools.find((t) => t.slug === "ai-upscale")!;
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [resultSrc, setResultSrc] = useState<string>("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("image/"));
    if (!f) return setStatus({ kind: "error", message: "Please choose a JPG, PNG or WebP image." });
    setFile(f);
    setPreviewSrc(URL.createObjectURL(f));
    setResultSrc("");
    setStatus({ kind: "idle" });
  };

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading Swin2SR model…", progress: 5 });
      const pipe = await loadPipeline<Upscaler>(
        "image-to-image",
        "Xenova/swin2SR-classical-sr-x2-64",
        (m, p) => setStatus({ kind: "working", message: m, progress: p }),
      );
      setStatus({ kind: "working", message: "Preparing image…", progress: 85 });
      const input = await shrinkIfNeeded(file);
      setStatus({ kind: "working", message: "Upscaling 2× — this can take 10-60s…", progress: 90 });
      const out = await pipe(input);
      const canvas = rawToCanvas(out);
      const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Encode failed"))), "image/png"));
      setResultSrc(URL.createObjectURL(blob));
      const name = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${name}-ai-2x.png`);
      setStatus({ kind: "success", message: `Upscaled to ${canvas.width}×${canvas.height}px — downloaded.` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a JPG, PNG or WebP image (best under 512px on the long side for speed).",
        "First run downloads the open-source Swin2SR-x2 super-resolution model (~50 MB) — cached after that.",
        "The neural network runs locally in your browser and downloads a sharp 2× PNG.",
      ]}
    >
      {!file ? (
        <Dropzone accept="image/*" multiple={false} onFiles={onFiles} hint="JPG, PNG or WebP · under 512px works best" />
      ) : (
        <>
          <FileList files={[file]} onRemove={() => { setFile(null); setPreviewSrc(""); setResultSrc(""); }} />
          <div className="grid gap-4 sm:grid-cols-2">
            {previewSrc && <div><p className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">Original</p><img src={previewSrc} alt="Original" className="mt-2 max-h-64 rounded-md border border-line" /></div>}
            {resultSrc && <div><p className="font-mono text-[11px] uppercase tracking-widest text-signal">2× Upscaled</p><img src={resultSrc} alt="Upscaled" className="mt-2 max-h-64 rounded-md border border-signal" /></div>}
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={run} disabled={status.kind === "working"} loading={status.kind === "working"}>
              Upscale 2×
            </PrimaryButton>
            <GhostButton onClick={() => { setFile(null); setPreviewSrc(""); setResultSrc(""); }}>Choose another</GhostButton>
          </div>
        </>
      )}
    </ToolShell>
  );
}