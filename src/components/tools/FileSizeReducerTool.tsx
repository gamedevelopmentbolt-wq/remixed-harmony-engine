import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob, formatBytes } from "@/lib/tool-utils";

const PRESETS = [
  { label: "WhatsApp doc (100 MB)", bytes: 100 * 1024 * 1024 },
  { label: "WhatsApp image (16 MB)", bytes: 16 * 1024 * 1024 },
  { label: "Gmail attachment (25 MB)", bytes: 25 * 1024 * 1024 },
  { label: "5 MB", bytes: 5 * 1024 * 1024 },
  { label: "2 MB", bytes: 2 * 1024 * 1024 },
  { label: "1 MB", bytes: 1 * 1024 * 1024 },
];

export function FileSizeReducerTool() {
  const tool = tools.find((t) => t.slug === "file-size-reducer")!;
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState(PRESETS[2].bytes);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const run = async () => {
    if (!file) return;
    if (file.size <= target) { setStatus({ kind: "success", message: "Already under target — no compression needed." }); return; }
    if (!file.type.startsWith("image/")) {
      setStatus({ kind: "error", message: "Only images can be auto-shrunk right now. For PDFs use Compress PDF." });
      return;
    }
    try {
      setStatus({ kind: "working", message: "Compressing…" });
      const img = await createImageBitmap(file);
      let scale = 1, quality = 0.9;
      let blob: Blob = file;
      for (let i = 0; i < 10; i++) {
        const c = document.createElement("canvas");
        c.width = Math.max(64, Math.round(img.width * scale));
        c.height = Math.max(64, Math.round(img.height * scale));
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/jpeg", quality));
        setStatus({ kind: "working", message: `Try ${i + 1}: ${formatBytes(blob.size)}`, progress: (i + 1) * 10 });
        if (blob.size <= target) break;
        if (quality > 0.5) quality -= 0.1; else scale *= 0.85;
      }
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + "-reduced.jpg");
      setStatus({ kind: "success", message: `Done — ${formatBytes(blob.size)}.` });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  };

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Upload the file that's too big to send.",
      "Pick a target: WhatsApp, Gmail, or a custom MB limit.",
      "Click Reduce — you get a smaller file that fits under the limit.",
    ]}>
      {!file && <Dropzone accept="image/*" multiple={false} onFiles={(fs) => setFile(fs[0])} hint="Images work best. PDFs — use Compress PDF." />}
      {file && (
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-paper-2/40 p-3 font-mono text-sm text-ink">{file.name} · {formatBytes(file.size)}</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" onClick={() => setTarget(p.bytes)} className={"rounded-full border px-3 py-1 font-mono text-xs " + (target === p.bytes ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>{p.label}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <PrimaryButton onClick={run} loading={status.kind === "working"}>Reduce</PrimaryButton>
            <button type="button" onClick={() => setFile(null)} className="font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">Change file</button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}