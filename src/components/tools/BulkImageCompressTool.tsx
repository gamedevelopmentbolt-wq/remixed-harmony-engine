import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob, formatBytes, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

type OutFmt = "keep" | "webp" | "jpeg" | "png" | "avif";
interface Row { file: File; outBlob?: Blob; outName?: string; err?: string }

export function BulkImageCompressTool() {
  const tool = tools.find((t) => t.slug === "bulk-image-compress")!;
  const [rows, setRows] = useState<Row[]>([]);
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState<OutFmt>("webp");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (files: File[]) => setRows(files.filter((f) => f.type.startsWith("image/")).map((file) => ({ file })));

  const process = async () => {
    if (rows.length === 0) return;
    setStatus({ kind: "working", message: "Compressing…", progress: 0 });
    const out: Row[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const url = await readFileAsDataURL(r.file);
        const img = await loadImage(url);
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        c.getContext("2d")!.drawImage(img, 0, 0);
        const outFmt = format === "keep" ? (r.file.type.split("/")[1] || "jpeg") : format;
        const mime = outFmt === "jpg" ? "image/jpeg" : `image/${outFmt}`;
        const blob: Blob = await new Promise((res, rej) => c.toBlob((b) => b ? res(b) : rej(new Error("encode failed")), mime, quality) );
        const ext = outFmt === "jpeg" ? "jpg" : outFmt;
        const base = r.file.name.replace(/\.[^.]+$/, "");
        out.push({ file: r.file, outBlob: blob, outName: `${base}.${ext}` });
      } catch (e) {
        out.push({ file: r.file, err: (e as Error).message });
      }
      setStatus({ kind: "working", message: `Compressing ${i + 1}/${rows.length}…`, progress: ((i + 1) / rows.length) * 100 });
    }
    setRows(out);
    setStatus({ kind: "success", message: `Done — ${out.filter((r) => r.outBlob).length} of ${out.length} compressed.` });
  };

  const downloadAll = async () => {
    const done = rows.filter((r) => r.outBlob);
    if (done.length === 0) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    done.forEach((r) => zip.file(r.outName!, r.outBlob!));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "compressed-images.zip");
  };

  const totalIn = rows.reduce((a, r) => a + r.file.size, 0);
  const totalOut = rows.reduce((a, r) => a + (r.outBlob?.size ?? 0), 0);

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Drop as many images as you like — JPG, PNG, WebP, AVIF or HEIC.",
      "Choose a target format and quality (lower = smaller file).",
      "Click Compress, then download everything as a single ZIP.",
    ]}>
      {rows.length === 0 && <Dropzone accept="image/*" onFiles={onFiles} hint="Add many images at once" />}

      {rows.length > 0 && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">Output format</span>
              <select value={format} onChange={(e) => setFormat(e.target.value as OutFmt)} className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm">
                <option value="webp">WebP (best size/quality)</option>
                <option value="jpeg">JPG</option>
                <option value="png">PNG (lossless)</option>
                <option value="avif">AVIF (smallest — modern browsers)</option>
                <option value="keep">Keep original format</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">Quality — {Math.round(quality * 100)}%</span>
              <input type="range" min={0.3} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-3 w-full" />
            </label>
          </div>

          <ul className="divide-y divide-line rounded-xl border border-line bg-white">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="min-w-0 flex-1 truncate font-mono text-ink">{r.file.name}</span>
                <span className="font-mono text-xs text-graphite">{formatBytes(r.file.size)}</span>
                <span className="font-mono text-xs text-graphite">→</span>
                <span className="font-mono text-xs text-signal">{r.outBlob ? formatBytes(r.outBlob.size) : r.err ? "error" : "…"}</span>
              </li>
            ))}
          </ul>

          {totalOut > 0 && (
            <p className="text-center font-mono text-xs uppercase tracking-widest text-workshop">
              Total {formatBytes(totalIn)} → {formatBytes(totalOut)} ({Math.max(0, Math.round((1 - totalOut / totalIn) * 100))}% smaller)
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton onClick={process} loading={status.kind === "working"} loadingText="Compressing…">Compress All</PrimaryButton>
            {totalOut > 0 && <PrimaryButton onClick={downloadAll}>Download ZIP</PrimaryButton>}
            <button type="button" onClick={() => setRows([])} className="ml-auto font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">Clear</button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}