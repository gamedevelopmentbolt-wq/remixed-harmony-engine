import { useEffect, useRef, useState } from "react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

type Mode = "resize" | "crop";
type Fmt = "image/jpeg" | "image/png" | "image/webp";

export function ImageResizeTool() {
  const tool = tools.find((t) => t.slug === "image-resize")!;
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string>("");
  const [natural, setNatural] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [mode, setMode] = useState<Mode>("resize");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [fmt, setFmt] = useState<Fmt>("image/jpeg");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const imgRef = useRef<HTMLImageElement>(null);
  const dragging = useRef<null | "move" | "resize">(null);
  const startRef = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (!file) return;
    (async () => {
      const url = await readFileAsDataURL(file);
      const img = await loadImage(url);
      setSrc(url);
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      setCrop({ x: (img.naturalWidth - s) / 2, y: (img.naturalHeight - s) / 2, w: s, h: s });
    })();
  }, [file]);

  const setW = (w: number) => {
    setWidth(w);
    if (lock && natural.w) setHeight(Math.round((w / natural.w) * natural.h));
  };
  const setH = (h: number) => {
    setHeight(h);
    if (lock && natural.h) setWidth(Math.round((h / natural.h) * natural.w));
  };

  const cropPreview = () => {
    if (!imgRef.current || !natural.w) return null;
    const rect = imgRef.current.getBoundingClientRect();
    const scale = rect.width / natural.w;
    return {
      left: crop.x * scale,
      top: crop.y * scale,
      width: crop.w * scale,
      height: crop.h * scale,
    };
  };

  const onCropDown = (e: React.PointerEvent, kind: "move" | "resize") => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragging.current = kind;
    startRef.current = { mx: e.clientX, my: e.clientY, x: crop.x, y: crop.y, w: crop.w, h: crop.h };
  };
  const onCropMove = (e: React.PointerEvent) => {
    if (!dragging.current || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const scale = natural.w / rect.width;
    const dx = (e.clientX - startRef.current.mx) * scale;
    const dy = (e.clientY - startRef.current.my) * scale;
    if (dragging.current === "move") {
      setCrop({
        x: Math.max(0, Math.min(natural.w - startRef.current.w, startRef.current.x + dx)),
        y: Math.max(0, Math.min(natural.h - startRef.current.h, startRef.current.y + dy)),
        w: startRef.current.w,
        h: startRef.current.h,
      });
    } else {
      setCrop({
        x: startRef.current.x,
        y: startRef.current.y,
        w: Math.max(20, Math.min(natural.w - startRef.current.x, startRef.current.w + dx)),
        h: Math.max(20, Math.min(natural.h - startRef.current.y, startRef.current.h + dy)),
      });
    }
  };
  const onCropUp = () => {
    dragging.current = null;
  };

  const run = async () => {
    if (!file || !src) return;
    try {
      setStatus({ kind: "working", message: "Processing…", progress: 20 });
      const img = await loadImage(src);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      if (mode === "resize") {
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        canvas.width = Math.round(crop.w);
        canvas.height = Math.round(crop.h);
        ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height);
      }
      setStatus({ kind: "working", message: "Encoding…", progress: 80 });
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, fmt, 0.92));
      if (!blob) throw new Error("encode failed");
      const ext = fmt === "image/jpeg" ? "jpg" : fmt === "image/png" ? "png" : "webp";
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${base}-${mode === "resize" ? `${canvas.width}x${canvas.height}` : "cropped"}.${ext}`);
      setStatus({ kind: "success", message: "Done." });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not process this image." });
    }
  };

  const preview = cropPreview();

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a JPG, PNG or WEBP image.",
        "Type exact pixel dimensions (with aspect-lock) or drag the crop box.",
        "Pick a format and download — the image is re-encoded in your browser.",
      ]}
    >
      {!file && <Dropzone accept="image/*" multiple={false} onFiles={(fs) => setFile(fs[0] ?? null)} hint="JPG, PNG or WEBP" />}
      {file && src && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-sm text-ink">
              {file.name} · <span className="text-graphite/70">{natural.w}×{natural.h}px</span>
            </p>
            <button type="button" onClick={() => setFile(null)} className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink">
              Choose another
            </button>
          </div>

          <div className="flex gap-2">
            {(["resize", "crop"] as Mode[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                className={"h-9 rounded-md border px-4 font-mono text-xs uppercase tracking-wider " + (mode === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}
              >
                {k}
              </button>
            ))}
          </div>

          {mode === "resize" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wider text-ink">Width (px)</span>
                <input type="number" value={width} onChange={(e) => setW(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm text-ink" />
              </label>
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wider text-ink">Height (px)</span>
                <input type="number" value={height} onChange={(e) => setH(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm text-ink" />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} />
                <span className="font-mono text-xs uppercase tracking-wider text-ink">Lock aspect ratio</span>
              </label>
              <div className="sm:col-span-2 flex gap-2">
                {[25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setWidth(Math.round((natural.w * pct) / 100));
                      setHeight(Math.round((natural.h * pct) / 100));
                    }}
                    className="h-8 rounded-md border border-line bg-white px-3 font-mono text-xs uppercase tracking-wider text-graphite hover:border-ink"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <div className="sm:col-span-2 flex justify-center rounded-xl border border-line bg-paper-2/50 p-4">
                <img src={src} alt="Preview" className="max-h-64 rounded" />
              </div>
            </div>
          ) : (
            <div
              className="relative inline-block max-w-full rounded-xl border border-line bg-paper-2/50 p-2 select-none"
              onPointerMove={onCropMove}
              onPointerUp={onCropUp}
            >
              <img ref={imgRef} src={src} alt="Crop" className="block max-h-96 w-auto rounded" draggable={false} />
              {preview && (
                <div
                  onPointerDown={(e) => onCropDown(e, "move")}
                  className="absolute cursor-move border-2 border-signal bg-signal/10"
                  style={{ left: preview.left + 8, top: preview.top + 8, width: preview.width, height: preview.height }}
                >
                  <div
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onCropDown(e, "resize");
                    }}
                    className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-sm border-2 border-signal bg-paper"
                  />
                </div>
              )}
              <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-graphite/60">
                Crop · {Math.round(crop.w)}×{Math.round(crop.h)}px @ ({Math.round(crop.x)}, {Math.round(crop.y)})
              </p>
            </div>
          )}

          <fieldset className="space-y-2">
            <legend className="font-mono text-xs uppercase tracking-wider text-ink">Output format</legend>
            <div className="grid grid-cols-3 gap-2">
              {(["image/jpeg", "image/png", "image/webp"] as Fmt[]).map((f) => (
                <label
                  key={f}
                  className={"cursor-pointer rounded-xl border p-2 text-center text-sm transition " + (fmt === f ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}
                >
                  <input type="radio" name="fmt" value={f} checked={fmt === f} onChange={() => setFmt(f)} className="sr-only" />
                  <span className="font-mono text-xs uppercase tracking-wider">{f.replace("image/", "")}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <PrimaryButton onClick={run} disabled={status.kind === "working"}>
            {mode === "resize" ? "Resize & download" : "Crop & download"}
          </PrimaryButton>
        </>
      )}
    </ToolShell>
  );
}
