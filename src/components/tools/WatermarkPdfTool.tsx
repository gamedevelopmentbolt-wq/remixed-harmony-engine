import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, readFileAsDataURL } from "@/lib/tool-utils";

export function WatermarkPdfTool() {
  const tool = tools.find((t) => t.slug === "watermark-pdf")!;
  const [pdf, setPdf] = useState<File | null>(null);
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("CONFIDENTIAL");
  const [size, setSize] = useState(60);
  const [angle, setAngle] = useState(45);
  const [opacity, setOpacity] = useState(0.25);
  const [color, setColor] = useState("#c53030");
  const [image, setImage] = useState<File | null>(null);
  const [imgScale, setImgScale] = useState(0.5);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
    };
  };

  const run = async () => {
    if (!pdf) return;
    try {
      setStatus({ kind: "working", message: "Loading PDF…", progress: 10 });
      const { PDFDocument, StandardFonts, degrees, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.load(new Uint8Array(await pdf.arrayBuffer()), { ignoreEncryption: true });
      const pages = doc.getPages();

      if (mode === "text") {
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const c = hexToRgb(color);
        for (let i = 0; i < pages.length; i++) {
          const p = pages[i];
          const { width, height } = p.getSize();
          const tw = font.widthOfTextAtSize(text, size);
          const th = size;
          p.drawText(text, {
            x: width / 2 - tw / 2,
            y: height / 2 - th / 2,
            size,
            font,
            color: rgb(c.r, c.g, c.b),
            opacity,
            rotate: degrees(angle),
          });
          setStatus({ kind: "working", message: `Watermarking page ${i + 1}/${pages.length}…`, progress: 10 + (i / pages.length) * 85 });
        }
      } else {
        if (!image) throw new Error("No image chosen.");
        const bytes = new Uint8Array(await image.arrayBuffer());
        const isPng = /\.png$/i.test(image.name) || image.type === "image/png";
        const embedded = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        for (let i = 0; i < pages.length; i++) {
          const p = pages[i];
          const { width, height } = p.getSize();
          const w = width * imgScale;
          const h = (embedded.height / embedded.width) * w;
          p.drawImage(embedded, {
            x: width / 2 - w / 2,
            y: height / 2 - h / 2,
            width: w,
            height: h,
            opacity,
            rotate: degrees(angle),
          });
          setStatus({ kind: "working", message: `Watermarking page ${i + 1}/${pages.length}…`, progress: 10 + (i / pages.length) * 85 });
        }
      }

      const out = await doc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), pdf.name.replace(/\.pdf$/i, "") + "-watermarked.pdf");
      setStatus({ kind: "success", message: "Watermarked PDF downloaded." });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not watermark this PDF. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF file.",
        "Pick a text or image watermark, then adjust color, opacity and rotation.",
        "The watermark is stamped on every page and the file is saved to your device.",
      ]}
    >
      {!pdf ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={(fs) => setPdf(fs[0] ?? null)} hint="One PDF file" />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-ink">{pdf.name}</p>
          <button type="button" onClick={() => setPdf(null)} className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink">
            Choose another
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {(["text", "image"] as const).map((k) => (
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

      {mode === "text" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Watermark text</span>
            <input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm text-ink" />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Font size ({size}pt)</span>
            <input type="range" min={12} max={160} value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Rotation ({angle}°)</span>
            <input type="range" min={-90} max={90} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Opacity ({Math.round(opacity * 100)}%)</span>
            <input type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Color</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 block h-10 w-full rounded-md border border-line bg-white" />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {!image ? (
            <Dropzone
              accept="image/png,image/jpeg"
              multiple={false}
              onFiles={async (fs) => {
                setImage(fs[0] ?? null);
              }}
              hint="PNG (transparent works best) or JPG"
            />
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">
              <img src={await_data(image)} alt="" className="h-16 w-16 rounded object-contain" />
              <p className="flex-1 font-mono text-sm text-ink">{image.name}</p>
              <button type="button" onClick={() => setImage(null)} className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink">
                Change
              </button>
            </div>
          )}
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Size ({Math.round(imgScale * 100)}% of page width)</span>
            <input type="range" min={10} max={100} value={Math.round(imgScale * 100)} onChange={(e) => setImgScale(Number(e.target.value) / 100)} className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Rotation ({angle}°)</span>
            <input type="range" min={-90} max={90} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Opacity ({Math.round(opacity * 100)}%)</span>
            <input type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="mt-1 block w-full" />
          </label>
        </div>
      )}

      <PrimaryButton onClick={run} disabled={!pdf || (mode === "image" && !image) || status.kind === "working"}>
        Add watermark
      </PrimaryButton>
    </ToolShell>
  );
}

// Best-effort inline preview URL (synchronous fallback).
function await_data(f: File) {
  return URL.createObjectURL(f);
}
