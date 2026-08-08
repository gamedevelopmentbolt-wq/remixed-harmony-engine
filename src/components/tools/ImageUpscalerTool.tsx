import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function ImageUpscalerTool() {
  const tool = tools.find((t) => t.slug === "image-upscaler")!;
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState<2 | 3 | 4>(2);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("image/"));
    if (!f) {
      setStatus({ kind: "error", message: "Please choose a JPG, PNG or WebP image." });
      return;
    }
    setFile(f);
    setPreviewSrc(URL.createObjectURL(f));
    setStatus({ kind: "idle" });
  };

  const upscale = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading image…", progress: 10 });
      const bitmap = await createImageBitmap(file);
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;
      setStatus({ kind: "working", message: `Upscaling to ${w}×${h}…`, progress: 40 });

      // Multi-pass bicubic-like: repeatedly scale by 2x with high-quality smoothing.
      let src: CanvasImageSource = bitmap;
      let cw = bitmap.width;
      let ch = bitmap.height;
      const passes = Math.ceil(Math.log2(scale));
      const perPass = Math.pow(scale, 1 / passes);
      for (let p = 0; p < passes; p++) {
        const nw = p === passes - 1 ? w : Math.round(cw * perPass);
        const nh = p === passes - 1 ? h : Math.round(ch * perPass);
        const c = document.createElement("canvas");
        c.width = nw; c.height = nh;
        const ctx = c.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(src, 0, 0, nw, nh);
        src = c;
        cw = nw; ch = nh;
      }

      setStatus({ kind: "working", message: "Encoding PNG…", progress: 85 });
      const finalCanvas = src as HTMLCanvasElement;
      const blob: Blob = await new Promise((res, rej) =>
        finalCanvas.toBlob((b) => (b ? res(b) : rej(new Error("Encode failed"))), "image/png"),
      );
      const name = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${name}-${scale}x.png`);
      setStatus({ kind: "success", message: `Upscaled to ${w}×${h}px — downloaded.` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a JPG, PNG or WebP image.",
        "Pick 2×, 3× or 4× — the tool enlarges in stages with high-quality smoothing for sharper results than a single scale.",
        "Downloads as PNG, straight from the browser.",
      ]}
    >
      {!file ? (
        <Dropzone accept="image/*" multiple={false} onFiles={onFiles} hint="JPG, PNG or WebP" />
      ) : (
        <>
          <FileList files={[file]} onRemove={() => { setFile(null); setPreviewSrc(null); }} />
          {previewSrc && (
            <img src={previewSrc} alt="Preview" className="mx-auto max-h-64 rounded-md border border-line" />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Scale</span>
            {([2, 3, 4] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={
                  "h-10 rounded-md border px-4 font-mono text-sm " +
                  (scale === s ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink")
                }
              >{s}×</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={upscale} disabled={status.kind === "working"}>Upscale image</PrimaryButton>
            <GhostButton onClick={() => { setFile(null); setPreviewSrc(null); }}>Choose another</GhostButton>
          </div>
        </>
      )}
    </ToolShell>
  );
}