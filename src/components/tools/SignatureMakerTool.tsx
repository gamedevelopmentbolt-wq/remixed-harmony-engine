import { useEffect, useRef, useState } from "react";
import { Download, Eraser } from "lucide-react";
import { PrimaryButton, ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

const FONTS = [
  { key: "pacifico", label: "Pacifico (script)", family: "'Pacifico', cursive" },
  { key: "cursive", label: "Handwriting", family: "'Segoe Script', 'Bradley Hand', cursive" },
  { key: "italic", label: "Italic serif", family: "Georgia, serif" },
  { key: "mono", label: "Monospace", family: "'IBM Plex Mono', monospace" },
];

type Mode = "draw" | "type";

export function SignatureMakerTool() {
  const tool = tools.find((t) => t.slug === "signature-maker")!;
  const [mode, setMode] = useState<Mode>("draw");
  const [color, setColor] = useState("#0b1220");
  const [stroke, setStroke] = useState(3);
  const [text, setText] = useState("Your Name");
  const [font, setFont] = useState(FONTS[0].family);
  const [fontSize, setFontSize] = useState(96);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const clear = () => {
    const c = canvasRef.current!; c.width = 900; c.height = 300;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
  };

  useEffect(() => { clear(); }, []);

  useEffect(() => {
    if (mode !== "type") return;
    const c = canvasRef.current!; c.width = 900; c.height = 300;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${font}`;
    ctx.textBaseline = "middle";
    const m = ctx.measureText(text);
    ctx.fillText(text, Math.max(20, (c.width - m.width) / 2), c.height / 2);
  }, [mode, text, font, fontSize, color]);

  const pt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => { drawing.current = true; last.current = pt(e); };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const p = pt(e); const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = color; ctx.lineWidth = stroke; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.current!.x, last.current!.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  };
  const up = () => { drawing.current = false; last.current = null; };

  const exportPng = () => canvasRef.current?.toBlob((b) => b && downloadBlob(b, "signature.png"), "image/png");
  const exportSvg = () => {
    // For typed mode, produce a crisp text SVG; for draw, embed the PNG.
    if (mode === "type") {
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300"><text x="450" y="150" text-anchor="middle" dominant-baseline="central" fill="${color}" font-family="${font}" font-size="${fontSize}">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "signature.svg");
    } else {
      const dataUrl = canvasRef.current!.toDataURL("image/png");
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 900 300"><image href="${dataUrl}" width="900" height="300"/></svg>`;
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "signature.svg");
    }
  };

  return (
    <ToolShell tool={tool} howItWorks={[
      "Pick Draw (mouse or touch) or Type (choose a font).",
      "Adjust color, thickness or font size. Your signature stays on a transparent background.",
      "Download as transparent PNG for any document, or SVG for infinite scaling.",
    ]}>
      <div className="flex gap-2">
        {(["draw", "type"] as Mode[]).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); if (m === "draw") clear(); }} className={"rounded-full border px-4 py-1 font-mono text-xs uppercase tracking-wider " + (mode === m ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>{m === "draw" ? "Draw" : "Type"}</button>
        ))}
      </div>

      {mode === "draw" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">Color<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-full rounded border border-line" /></label>
          <label className="text-sm">Stroke ({stroke}px)<input type="range" min={1} max={12} value={stroke} onChange={(e) => setStroke(+e.target.value)} className="mt-2 w-full" /></label>
          <button type="button" onClick={clear} className="mt-6 inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:bg-paper-2"><Eraser className="h-4 w-4" />Clear</button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm sm:col-span-2">Text<input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded border border-line p-2 font-mono text-sm" /></label>
          <label className="text-sm">Font
            <select value={font} onChange={(e) => setFont(e.target.value)} className="mt-1 w-full rounded border border-line bg-white p-2 font-mono text-sm">
              {FONTS.map((f) => <option key={f.key} value={f.family}>{f.label}</option>)}
            </select>
          </label>
          <label className="text-sm">Size ({fontSize}px)<input type="range" min={40} max={180} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="mt-2 w-full" /></label>
          <label className="text-sm">Color<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-full rounded border border-line" /></label>
        </div>
      )}

      <div className="rounded-xl border border-line bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)_50%_/_16px_16px] p-3">
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="mx-auto block h-auto w-full max-w-3xl cursor-crosshair rounded bg-transparent"
          style={{ touchAction: "none" }}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={exportPng}><Download className="h-4 w-4" />Download transparent PNG</PrimaryButton>
        <button type="button" onClick={exportSvg} className="inline-flex h-12 items-center gap-2 rounded-md border border-ink bg-white px-5 font-mono text-sm font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper">Download SVG</button>
      </div>
    </ToolShell>
  );
}