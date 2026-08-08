import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsText } from "@/lib/tool-utils";

export function SvgToPngTool() {
  const tool = tools.find((t) => t.slug === "svg-to-png")!;
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(1024);
  const [transparent, setTransparent] = useState(true);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  async function convert() {
    if (!file) return;
    setStatus({ kind: "working", message: "Rasterizing…" });
    try {
      const svgText = await readFileAsText(file);
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = await loadImage(url);
      URL.revokeObjectURL(url);
      const ratio = img.height / img.width || 1;
      const c = document.createElement("canvas");
      c.width = width; c.height = Math.round(width * ratio);
      const ctx = c.getContext("2d")!;
      if (!transparent) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => {
        if (!b) return setStatus({ kind: "error", message: "Rasterize failed." });
        downloadBlob(b, file.name.replace(/\.svg$/i, "") + ".png");
        setStatus({ kind: "success", message: `Exported ${c.width}×${c.height} PNG.` });
      }, "image/png");
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? "Failed." });
    }
  }

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Drop an .svg file — logo, icon or illustration.",
        "Pick the export width in pixels; the height keeps the SVG's original ratio.",
        "Download a crisp PNG at exactly the resolution you asked for.",
      ]}>
      <Dropzone accept="image/svg+xml,.svg" multiple={false} onFiles={(fs) => setFile(fs[0])} />
      {file && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">Width (px)</span>
              <input type="number" min={16} max={4096} value={width} onChange={(e) => setWidth(Math.max(16, Math.min(4096, Number(e.target.value) || 1024)))}
                className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
            </label>
            <label className="flex items-end gap-2 pb-2"><input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} /> Transparent background</label>
          </div>
          <PrimaryButton onClick={convert} loading={status.kind === "working"}>Export PNG</PrimaryButton>
        </>
      )}
    </ToolShell>
  );
}
