import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

type Preset = { key: string; label: string; size: number; square: boolean; bg: "white" | "transparent" };
const PRESETS: Preset[] = [
  { key: "amazon", label: "Amazon 2000×2000 white", size: 2000, square: true, bg: "white" },
  { key: "shopify", label: "Shopify 2048×2048 white", size: 2048, square: true, bg: "white" },
  { key: "daraz", label: "Daraz 1000×1000 white", size: 1000, square: true, bg: "white" },
  { key: "ebay", label: "eBay 1600×1600 white", size: 1600, square: true, bg: "white" },
  { key: "transparent", label: "Transparent PNG (original ratio)", size: 0, square: false, bg: "transparent" },
];

export function ProductBgRemoverTool() {
  const tool = tools.find((t) => t.slug === "product-bg-remover")!;
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFiles = async (fs: File[]) => {
    const f = fs[0];
    if (!f || !/^image\//.test(f.type)) return setStatus({ kind: "error", message: "Please choose an image (JPG or PNG)." });
    setFile(f);
    setDataUrl(await readFileAsDataURL(f));
  };

  useEffect(() => {
    (async () => {
      if (!dataUrl) return;
      try {
        setStatus({ kind: "working", message: "Removing background (first run downloads the model, ~40 MB)…" });
        const { removeBackground } = await import("@imgly/background-removal");
        const blob = await removeBackground(dataUrl);
        const url = URL.createObjectURL(blob);
        const img = await loadImage(url);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        const c = canvasRef.current!;
        if (preset.square) {
          c.width = preset.size; c.height = preset.size;
          const ctx = c.getContext("2d")!;
          if (preset.bg === "white") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
          else ctx.clearRect(0, 0, c.width, c.height);
          // contain fit with 6% padding for e-commerce standards
          const pad = preset.size * 0.06;
          const inner = preset.size - pad * 2;
          const r = Math.min(inner / img.width, inner / img.height);
          const w = img.width * r, h = img.height * r;
          ctx.drawImage(img, (preset.size - w) / 2, (preset.size - h) / 2, w, h);
        } else {
          c.width = img.width; c.height = img.height;
          const ctx = c.getContext("2d")!;
          ctx.clearRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0);
        }
        setStatus({ kind: "success", message: "Ready. Preview below — download when it looks right." });
      } catch (e) {
        console.error(e);
        setStatus({ kind: "error", message: "Couldn't remove the background. Try a smaller image or a different format." });
      }
    })();
  }, [dataUrl, preset]);

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const type = preset.bg === "white" ? "image/jpeg" : "image/png";
    const ext = preset.bg === "white" ? "jpg" : "png";
    c.toBlob((b) => b && downloadBlob(b, (file?.name.replace(/\.[^.]+$/, "") ?? "product") + `-${preset.key}.${ext}`), type, 0.95);
  };

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Drop a product photo (JPG or PNG).",
      "Pick a marketplace preset — Amazon, Shopify, Daraz, eBay or a raw transparent PNG.",
      "The background is removed in your browser and the image is padded to the correct pixel size.",
    ]}>
      {!file && <Dropzone accept="image/*" multiple={false} onFiles={onFiles} hint="One product photo (JPG or PNG)" />}
      {file && (
        <>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.key} type="button" onClick={() => setPreset(p)} className={"rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider " + (preset.key === p.key ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>{p.label}</button>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)_50%_/_16px_16px] p-4">
            <canvas ref={canvasRef} className="mx-auto block max-h-[520px] w-auto max-w-full" />
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={download}><Download className="h-4 w-4" />Download {preset.bg === "white" ? "JPG" : "PNG"}</PrimaryButton>
            <button type="button" onClick={() => { setFile(null); setDataUrl(null); }} className="font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">Choose a different image</button>
          </div>
        </>
      )}
    </ToolShell>
  );
}