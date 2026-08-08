import { useRef, useState } from "react";
import { Copy } from "lucide-react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";
import { Dropzone } from "./Dropzone";

const RAMP = " .:-=+*#%@";

export function ImageToAsciiTool() {
  const tool = tools.find((t) => t.slug === "image-to-ascii")!;
  const [width, setWidth] = useState(90);
  const [invert, setInvert] = useState(false);
  const [ascii, setAscii] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "working" | "success" | "error"; message?: string }>({ kind: "idle" });
  const preRef = useRef<HTMLPreElement>(null);

  async function handle(files: File[]) {
    const file = files[0];
    if (!file) return;
    setStatus({ kind: "working" });
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();
      const canvas = document.createElement("canvas");
      const cw = Math.max(20, Math.min(300, width));
      const ratio = img.height / img.width;
      const ch = Math.round(cw * ratio * 0.5); // characters are ~2x taller than wide
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, cw, ch);
      const data = ctx.getImageData(0, 0, cw, ch).data;
      const rows: string[] = [];
      for (let y = 0; y < ch; y++) {
        let row = "";
        for (let x = 0; x < cw; x++) {
          const i = (y * cw + x) * 4;
          const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          const idx = Math.floor((invert ? 255 - gray : gray) / 255 * (RAMP.length - 1));
          row += RAMP[idx];
        }
        rows.push(row);
      }
      setAscii(rows.join("\n"));
      setStatus({ kind: "success" });
    } catch {
      setStatus({ kind: "error" });
    }
  }

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a photo, logo or screenshot into the box. Higher contrast images give the best ASCII output.",
        "Pick a width in characters (60–120 works well) and optionally invert light and dark.",
        "Copy the ASCII text or download it as a .txt file. Everything runs in your browser — the image never leaves your device.",
      ]}
    >
      <Dropzone onFiles={handle} accept="image/*" multiple={false} hint="Drop an image or click to browse" />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="rounded-md border border-line bg-white p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Width ({width} chars)</p>
          <input type="range" min={40} max={200} value={width} onChange={(e) => setWidth(+e.target.value)} className="mt-2 w-full" />
        </label>
        <label className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
          <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} className="h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-widest text-graphite/80">Invert (for dark backgrounds)</span>
        </label>
      </div>

      {ascii && (
        <>
          <pre ref={preRef} className="max-h-[520px] overflow-auto rounded-xl border border-line bg-ink p-4 font-mono text-[8px] leading-[8px] text-paper">{ascii}</pre>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(ascii)}
              className="inline-flex items-center gap-1 rounded border border-line bg-white px-3 py-1.5 font-mono text-xs hover:bg-paper-2"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
            <button
              onClick={() => {
                const blob = new Blob([ascii], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "ascii-art.txt"; a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
              className="inline-flex items-center gap-1 rounded border border-line bg-white px-3 py-1.5 font-mono text-xs hover:bg-paper-2"
            >
              Download .txt
            </button>
          </div>
        </>
      )}
    </ToolShell>
  );
}
