import { useEffect, useRef, useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

type Preset = "free" | "1:1" | "4:5" | "16:9" | "9:16" | "3:2";

export function ImageCropTool() {
  const tool = tools.find((t) => t.slug === "image-crop")!;
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [preset, setPreset] = useState<Preset>("1:1");
  const [rect, setRect] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!file) return;
    (async () => {
      const url = await readFileAsDataURL(file);
      const image = await loadImage(url);
      setImg(image);
    })();
  }, [file]);

  useEffect(() => {
    if (!img) return;
    const c = canvasRef.current!;
    const maxW = 640;
    const scale = Math.min(1, maxW / img.width);
    c.width = img.width * scale;
    c.height = img.height * scale;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    // apply preset to rect aspect
    if (preset !== "free") {
      const [aw, ah] = preset.split(":").map(Number);
      const targetAR = aw / ah;
      const curAR = (rect.w * c.width) / (rect.h * c.height);
      if (Math.abs(curAR - targetAR) > 0.01) {
        // adjust height from center
        const w = rect.w;
        const newHNorm = (w * c.width) / targetAR / c.height;
        setRect((r) => ({ ...r, h: Math.min(0.98, newHNorm) }));
        return;
      }
    }
    // overlay
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, c.width, c.height);
    const rx = rect.x * c.width, ry = rect.y * c.height, rw = rect.w * c.width, rh = rect.h * c.height;
    ctx.clearRect(rx, ry, rw, rh);
    ctx.drawImage(img, rx / scale, ry / scale, rw / scale, rh / scale, rx, ry, rw, rh);
    ctx.strokeStyle = "#ff3b00"; ctx.lineWidth = 2;
    ctx.strokeRect(rx, ry, rw, rh);
  }, [img, rect, preset]);

  async function apply() {
    if (!img || !file) return;
    setStatus({ kind: "working", message: "Cropping…" });
    const out = document.createElement("canvas");
    out.width = Math.round(rect.w * img.width);
    out.height = Math.round(rect.h * img.height);
    out.getContext("2d")!.drawImage(img, rect.x * img.width, rect.y * img.height, out.width, out.height, 0, 0, out.width, out.height);
    out.toBlob((blob) => {
      if (!blob) { setStatus({ kind: "error", message: "Crop failed." }); return; }
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + "-cropped.png");
      setStatus({ kind: "success", message: "Cropped." });
    }, "image/png");
  }

  const Slider = ({ label, k, max = 1 }: { label: string; k: keyof typeof rect; max?: number }) => (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-ink">{label}</span>
      <input type="range" min={0} max={max} step={0.01} value={rect[k]}
        onChange={(e) => setRect((r) => ({ ...r, [k]: Number(e.target.value) }))} className="mt-2 block w-full" />
    </label>
  );

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Drop any JPG, PNG or WEBP image.",
        "Pick an aspect ratio preset (square, story, 16:9) or freeform, then adjust the crop box.",
        "Download the cropped image — PNG with lossless quality.",
      ]}>
      <Dropzone accept="image/*" multiple={false} onFiles={(fs) => setFile(fs[0])} />
      {img && (
        <>
          <div className="flex flex-wrap gap-2">
            {(["free", "1:1", "4:5", "16:9", "9:16", "3:2"] as Preset[]).map((p) => (
              <button key={p} onClick={() => setPreset(p)}
                className={"rounded-md border px-3 py-1 font-mono text-xs " + (preset === p ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink")}>{p}</button>
            ))}
          </div>
          <canvas ref={canvasRef} className="mx-auto max-w-full rounded-md border border-line" />
          <div className="grid gap-3 sm:grid-cols-4">
            <Slider label="X" k="x" />
            <Slider label="Y" k="y" />
            <Slider label="Width" k="w" />
            <Slider label="Height" k="h" />
          </div>
          <PrimaryButton onClick={apply}>Crop & download</PrimaryButton>
        </>
      )}
    </ToolShell>
  );
}
