import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, formatBytes } from "@/lib/tool-utils";

type Preset = "tiny" | "balanced" | "high";
const PRESETS: Record<Preset, { maxSizeMB: number; label: string }> = {
  tiny: { maxSizeMB: 0.05, label: "Tiny · ~50 KB" },
  balanced: { maxSizeMB: 0.3, label: "Balanced · ~300 KB" },
  high: { maxSizeMB: 1.0, label: "High quality · ~1 MB" },
};

export function CompressImageTool() {
  const tool = tools.find((t) => t.slug === "compress-image")!;
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState<Preset>("balanced");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const add = (fs: File[]) => setFiles((prev) => [...prev, ...fs.filter((f) => f.type.startsWith("image/"))]);
  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const run = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Preparing…", progress: 3 });
      const imageCompression = (await import("browser-image-compression")).default;
      const { maxSizeMB } = PRESETS[preset];
      const compressed: File[] = [];
      let before = 0;
      let after = 0;
      for (let i = 0; i < files.length; i++) {
        setStatus({ kind: "working", message: `Compressing ${files[i].name}…`, progress: 5 + (i / files.length) * 90 });
        before += files[i].size;
        const out = await imageCompression(files[i], {
          maxSizeMB,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
          initialQuality: 0.8,
        });
        after += out.size;
        compressed.push(out);
      }

      const pct = before > 0 ? Math.max(0, Math.round(((before - after) / before) * 100)) : 0;

      if (compressed.length === 1) {
        const f = compressed[0];
        downloadBlob(f, f.name.replace(/(\.[^.]+)?$/, (m) => (m ? m : ".jpg")));
      } else {
        setStatus({ kind: "working", message: "Bundling ZIP…", progress: 97 });
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        compressed.forEach((f) => zip.file(f.name, f));
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, "compressed-images.zip");
      }
      setStatus({
        kind: "success",
        message: `${formatBytes(before)} → ${formatBytes(after)} · ${pct}% smaller.`,
      });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not compress one or more images. Make sure they are valid JPG or PNG." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop one or more JPG or PNG images.",
        "Pick a target size — smaller means more compression.",
        "Each image is re-encoded in your browser and downloaded (a ZIP if many).",
      ]}
    >
      <Dropzone accept="image/*" onFiles={add} hint="JPG or PNG images" />
      <FileList files={files} onRemove={remove} />
      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Target size</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(PRESETS) as Preset[]).map((k) => (
            <label
              key={k}
              className={
                "cursor-pointer rounded-xl border p-3 text-sm transition " +
                (preset === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")
              }
            >
              <input type="radio" name="preset" value={k} checked={preset === k} onChange={() => setPreset(k)} className="sr-only" />
              <p className="font-mono text-xs uppercase tracking-wider">{k}</p>
              <p className={"mt-1 text-xs " + (preset === k ? "text-paper/80" : "text-graphite/70")}>
                {PRESETS[k].label}
              </p>
            </label>
          ))}
        </div>
      </fieldset>
      <PrimaryButton onClick={run} disabled={files.length === 0 || status.kind === "working"}>
        Compress images
      </PrimaryButton>
    </ToolShell>
  );
}
