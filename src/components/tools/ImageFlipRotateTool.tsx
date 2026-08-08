import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

export function ImageFlipRotateTool() {
  const tool = tools.find((t) => t.slug === "image-flip-rotate")!;
  const [files, setFiles] = useState<File[]>([]);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [angle, setAngle] = useState(0);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  async function process() {
    if (files.length === 0) return;
    setStatus({ kind: "working", message: "Processing…", progress: 0 });
    try {
      const isBatch = files.length > 1;
      let JSZip: any = null;
      if (isBatch) JSZip = (await import("jszip")).default;
      const zip = isBatch ? new JSZip() : null;
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setStatus({ kind: "working", message: `Processing ${i + 1}/${files.length}…`, progress: ((i + 1) / files.length) * 100 });
        const img = await loadImage(await readFileAsDataURL(f));
        const rad = (angle * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad));
        const w = img.width * cos + img.height * sin;
        const h = img.width * sin + img.height * cos;
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d")!;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rad);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
        const name = f.name.replace(/\.[^.]+$/, "") + "-transformed.png";
        if (zip) zip.file(name, blob); else downloadBlob(blob, name);
      }
      if (zip) {
        const out = await zip.generateAsync({ type: "blob" });
        downloadBlob(out, "flipped-rotated.zip");
      }
      setStatus({ kind: "success", message: `Done. Processed ${files.length} image(s).` });
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? "Failed." });
    }
  }

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Drop one or many images. Batch runs export a single ZIP.",
        "Flip horizontally or vertically, and rotate by any angle in degrees.",
        "Everything happens in your browser — no upload, no quality loss on PNG output.",
      ]}>
      <Dropzone accept="image/*" multiple onFiles={setFiles} />
      {files.length > 0 && <p className="font-mono text-sm text-ink">{files.length} file(s) selected</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} /> Flip horizontally</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} /> Flip vertically</label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Rotate {angle}°</span>
          <input type="range" min={-180} max={180} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="mt-2 block w-full" />
          <div className="mt-1 flex gap-1">
            {[0, 90, 180, 270].map((a) => (
              <button key={a} onClick={() => setAngle(a)} className="rounded border border-line bg-white px-2 py-0.5 font-mono text-xs">{a}°</button>
            ))}
          </div>
        </label>
      </div>
      <PrimaryButton onClick={process} loading={status.kind === "working"} disabled={files.length === 0}>Process {files.length > 1 ? "batch" : "image"}</PrimaryButton>
    </ToolShell>
  );
}
