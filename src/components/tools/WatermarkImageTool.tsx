import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

type Mode = "add" | "remove";
type Pos = "tl" | "tr" | "bl" | "br" | "center" | "tile";

export function WatermarkImageTool() {
  const tool = tools.find((t) => t.slug === "watermark-image")!;
  const [mode, setMode] = useState<Mode>("add");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  // Add-mode state
  const [text, setText] = useState("© EasyFileMagic");
  const [size, setSize] = useState(48);
  const [opacity, setOpacity] = useState(40);
  const [color, setColor] = useState("#ffffff");
  const [pos, setPos] = useState<Pos>("br");
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Remove-mode state
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const removeRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const brush = useRef(30);

  const stamp = (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ctx.font = `${size}px sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.textBaseline = "alphabetic";
    const pad = Math.round(size * 0.5);
    const m = ctx.measureText(text);
    const w = m.width, h = size;
    const put = (x: number, y: number) => ctx.fillText(text, x, y);
    if (pos === "tile") {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      const step = Math.max(w, h) * 1.8;
      for (let y = -canvas.height; y < canvas.height; y += step) {
        for (let x = -canvas.width; x < canvas.width; x += step) put(x, y);
      }
      ctx.restore();
    } else if (pos === "center") put((canvas.width - w) / 2, (canvas.height + h) / 2);
    else if (pos === "tl") put(pad, pad + h);
    else if (pos === "tr") put(canvas.width - w - pad, pad + h);
    else if (pos === "bl") put(pad, canvas.height - pad);
    else put(canvas.width - w - pad, canvas.height - pad);
    ctx.globalAlpha = 1;
  };

  // Live preview for add mode
  useEffect(() => {
    (async () => {
      const f = files[0]; const c = previewRef.current;
      if (!f || !c || mode !== "add") return;
      const img = await loadImage(await readFileAsDataURL(f));
      stamp(c, img);
    })();
  }, [files, mode, text, size, opacity, color, pos]); // eslint-disable-line

  // Load first image into remove canvas
  useEffect(() => {
    (async () => {
      if (mode !== "remove" || !files[0]) return;
      const url = await readFileAsDataURL(files[0]);
      setSrcUrl(url);
      const img = await loadImage(url);
      const c = removeRef.current!; c.width = img.width; c.height = img.height;
      c.getContext("2d")!.drawImage(img, 0, 0);
    })();
  }, [files, mode]);

  const onFiles = (fs: File[]) => {
    const imgs = fs.filter((f) => /^image\//.test(f.type));
    if (!imgs.length) return setStatus({ kind: "error", message: "Please choose image files." });
    setFiles(imgs);
    setStatus({ kind: "idle" });
  };

  const exportAdd = async () => {
    setStatus({ kind: "working", message: "Rendering…" });
    try {
      if (files.length === 1) {
        const c = document.createElement("canvas");
        const img = await loadImage(await readFileAsDataURL(files[0]));
        stamp(c, img);
        await new Promise<void>((r) => c.toBlob((b) => { if (b) downloadBlob(b, files[0].name.replace(/\.[^.]+$/, "") + "-watermarked.jpg"); r(); }, "image/jpeg", 0.92));
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (const f of files) {
          const c = document.createElement("canvas");
          const img = await loadImage(await readFileAsDataURL(f));
          stamp(c, img);
          const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.92));
          zip.file(f.name.replace(/\.[^.]+$/, "") + "-watermarked.jpg", blob);
        }
        const out = await zip.generateAsync({ type: "blob" });
        downloadBlob(out, "watermarked.zip");
      }
      setStatus({ kind: "success", message: "Done." });
    } catch (e) {
      console.error(e);
      setStatus({ kind: "error", message: "Could not render." });
    }
  };

  // Brush-based simple remover: sample surrounding pixels and blur-fill the masked area.
  const paintAt = (x: number, y: number) => {
    const c = removeRef.current!; const ctx = c.getContext("2d")!;
    const r = brush.current;
    const src = ctx.getImageData(Math.max(0, x - r * 3), Math.max(0, y - r * 3), Math.min(c.width, r * 6), Math.min(c.height, r * 6));
    // Simple box-blur average within brush area for a quick, browser-only patch fill.
    let R = 0, G = 0, B = 0, count = 0;
    const w = src.width;
    for (let py = 0; py < src.height; py++) {
      for (let px = 0; px < w; px++) {
        const i = (py * w + px) * 4;
        R += src.data[i]; G += src.data[i + 1]; B += src.data[i + 2]; count++;
      }
    }
    R = R / count; G = G / count; B = B / count;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = `rgb(${R|0},${G|0},${B|0})`;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  };
  const canvasPt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = removeRef.current!; const rect = c.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * c.width, y: ((e.clientY - rect.top) / rect.height) * c.height };
  };
  const exportRemove = () => {
    const c = removeRef.current; if (!c) return;
    c.toBlob((b) => b && downloadBlob(b, "watermark-removed.jpg"), "image/jpeg", 0.92);
  };
  const resetRemove = async () => { if (srcUrl) { const img = await loadImage(srcUrl); const c = removeRef.current!; c.width = img.width; c.height = img.height; c.getContext("2d")!.drawImage(img, 0, 0); } };

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Pick Add (stamp a text watermark on one or many images) or Remove (paint over a watermark to blur-fill it).",
      "Drop your image(s), tweak the settings and preview the result live.",
      "Download the single image, or a ZIP if you added a batch.",
    ]}>
      <div className="flex gap-2">
        {(["add", "remove"] as Mode[]).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={"rounded-full border px-4 py-1 font-mono text-xs uppercase tracking-wider " + (mode === m ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>{m === "add" ? "Add watermark" : "Remove watermark"}</button>
        ))}
      </div>

      {!files.length && <Dropzone accept="image/*" multiple={mode === "add"} onFiles={onFiles} hint={mode === "add" ? "One or many images — batch exports as ZIP" : "One image"} />}

      {files.length > 0 && mode === "add" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm">Text<input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded border border-line p-2 font-mono text-sm" /></label>
            <label className="text-sm">Size ({size}px)<input type="range" min={12} max={200} value={size} onChange={(e) => setSize(+e.target.value)} className="mt-2 w-full" /></label>
            <label className="text-sm">Opacity ({opacity}%)<input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="mt-2 w-full" /></label>
            <label className="text-sm">Color<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-full rounded border border-line" /></label>
            <label className="text-sm">Position
              <select value={pos} onChange={(e) => setPos(e.target.value as Pos)} className="mt-1 w-full rounded border border-line bg-white p-2 font-mono text-sm">
                <option value="tl">Top-left</option><option value="tr">Top-right</option><option value="bl">Bottom-left</option><option value="br">Bottom-right</option>
                <option value="center">Center</option><option value="tile">Tiled (diagonal)</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl border border-line bg-paper-2 p-3">
            <canvas ref={previewRef} className="mx-auto block max-h-[500px] w-auto max-w-full" />
            <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-widest text-graphite/60">Preview of {files[0].name} · {files.length} image{files.length > 1 ? "s" : ""} queued</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={exportAdd}><Download className="h-4 w-4" />{files.length > 1 ? "Download all as ZIP" : "Download JPG"}</PrimaryButton>
            <button type="button" onClick={() => setFiles([])} className="font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">Choose different images</button>
          </div>
        </>
      )}

      {files.length > 0 && mode === "remove" && (
        <>
          <p className="rounded-md border border-line bg-paper-2 p-3 text-xs text-graphite">
            Simple mask-based remover — works best when the watermark sits on a plain or lightly-textured background. Paint over the watermark; the tool averages nearby pixels and fills the brushed area. For deep, high-contrast watermarks on busy photos, results will be approximate.
          </p>
          <label className="text-sm">Brush size ({brush.current}px)<input type="range" min={8} max={120} defaultValue={30} onChange={(e) => { brush.current = +e.target.value; }} className="mt-2 w-full" /></label>
          <div className="rounded-xl border border-line bg-paper-2 p-3">
            <canvas
              ref={removeRef}
              onPointerDown={(e) => { drawing.current = true; const p = canvasPt(e); paintAt(p.x, p.y); }}
              onPointerMove={(e) => { if (!drawing.current) return; const p = canvasPt(e); paintAt(p.x, p.y); }}
              onPointerUp={() => { drawing.current = false; }}
              onPointerLeave={() => { drawing.current = false; }}
              className="mx-auto block max-h-[520px] w-auto max-w-full cursor-crosshair"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={exportRemove}><Download className="h-4 w-4" />Download cleaned image</PrimaryButton>
            <button type="button" onClick={resetRemove} className="font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">Reset</button>
            <button type="button" onClick={() => setFiles([])} className="font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">Different image</button>
          </div>
        </>
      )}
    </ToolShell>
  );
}