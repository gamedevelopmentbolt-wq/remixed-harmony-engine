import { useEffect, useRef, useState } from "react";
import { Dropzone } from "./Dropzone";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  cw: number,
  ch: number,
  position: "top" | "bottom",
  fontSize: number,
) {
  if (!text) return;
  ctx.save();
  ctx.font = `900 ${fontSize}px Impact, "Anton", "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = position === "top" ? "top" : "bottom";
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, fontSize / 12);
  const lines = wrapText(ctx, text.toUpperCase(), cw * 0.92);
  const lineHeight = fontSize * 1.05;
  const pad = Math.max(12, ch * 0.02);
  lines.forEach((line, i) => {
    const y =
      position === "top" ? pad + i * lineHeight : ch - pad - (lines.length - 1 - i) * lineHeight;
    ctx.strokeText(line, cw / 2, y);
    ctx.fillText(line, cw / 2, y);
  });
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function MemeGeneratorTool() {
  const tool = tools.find((t) => t.slug === "meme-generator")!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [top, setTop] = useState("");
  const [bottom, setBottom] = useState("");
  const [fontPct, setFontPct] = useState(10);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onFiles = async (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("image/"));
    if (!f) return setStatus({ kind: "error", message: "Please choose an image." });
    setFile(f);
    const url = await readFileAsDataURL(f);
    setSrcUrl(url);
    imgRef.current = await loadImage(url);
    setStatus({ kind: "idle" });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !srcUrl) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const fontSize = Math.round((canvas.height * fontPct) / 100);
    drawCaption(ctx, top, canvas.width, canvas.height, "top", fontSize);
    drawCaption(ctx, bottom, canvas.width, canvas.height, "bottom", fontSize);
  }, [srcUrl, top, bottom, fontPct]);

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"),
    );
    downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + "-meme.png");
    setStatus({ kind: "success", message: "Meme downloaded." });
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Upload any image — a screenshot, a photo, a reaction GIF frame.",
        "Type your top and bottom captions. Classic Impact font with a black outline is auto-applied.",
        "Preview updates live; click Download to save the meme as a PNG.",
      ]}
    >
      {!file ? (
        <Dropzone
          accept="image/*"
          multiple={false}
          onFiles={onFiles}
          hint="JPG, PNG or WebP"
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">Top text</span>
              <input
                type="text"
                value={top}
                onChange={(e) => setTop(e.target.value)}
                className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
                placeholder="ONE DOES NOT SIMPLY"
              />
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">Bottom text</span>
              <input
                type="text"
                value={bottom}
                onChange={(e) => setBottom(e.target.value)}
                className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
                placeholder="MAKE A MEME"
              />
            </label>
          </div>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">
              Font size ({fontPct}% of image height)
            </span>
            <input
              type="range"
              min={4}
              max={18}
              value={fontPct}
              onChange={(e) => setFontPct(Number(e.target.value))}
              className="mt-2 block w-full"
            />
          </label>
          <div className="overflow-hidden rounded-xl border border-line bg-paper-2">
            <canvas
              ref={canvasRef}
              className="mx-auto block h-auto max-h-[70vh] w-auto max-w-full"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={download}>Download PNG</PrimaryButton>
            <GhostButton
              type="button"
              onClick={() => {
                setFile(null);
                setSrcUrl(null);
                imgRef.current = null;
                setTop("");
                setBottom("");
              }}
            >
              Reset
            </GhostButton>
          </div>
        </div>
      )}
    </ToolShell>
  );
}