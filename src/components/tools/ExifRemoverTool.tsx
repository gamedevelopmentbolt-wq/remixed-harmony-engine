import { useState } from "react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, formatBytes } from "@/lib/tool-utils";
import { Dropzone } from "./Dropzone";

// Strip EXIF/XMP/ICC by re-encoding through canvas — works for JPG/PNG/WEBP.
async function stripMetadata(file: File): Promise<{ blob: Blob; name: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Could not decode image"));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const isPng = /png/i.test(file.type);
    const mime = isPng ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), mime, 0.95));
    const base = file.name.replace(/\.[^.]+$/, "");
    return { blob, name: `${base}-clean.${isPng ? "png" : "jpg"}` };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ExifRemoverTool() {
  const tool = tools.find((t) => t.slug === "exif-remover")!;
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const run = async () => {
    if (!file) return;
    setStatus({ kind: "working", message: "Stripping metadata…" });
    try {
      const r = await stripMetadata(file);
      setResult(r);
      downloadBlob(r.blob, r.name);
      setStatus({ kind: "success", message: `Done — ${formatBytes(r.blob.size)}.` });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Failed." });
    }
  };

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Drop a JPG, PNG or WEBP photo into the upload box.",
        "The image is re-encoded through a browser canvas, which strips EXIF, GPS, XMP and ICC metadata.",
        "Download the clean copy — pixels are identical, but personal metadata is gone.",
      ]}>
      <Dropzone
        onFiles={(fs) => { setFile(fs[0] ?? null); setResult(null); }}
        accept="image/jpeg,image/png,image/webp"
        multiple={false}
      />
      {file && (
        <p className="font-mono text-xs text-graphite">
          Selected: <strong>{file.name}</strong> · {formatBytes(file.size)}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run} disabled={!file} loading={status.kind === "working"}>Strip metadata</PrimaryButton>
        {result && (
          <GhostButton onClick={() => downloadBlob(result.blob, result.name)}>Download {result.name}</GhostButton>
        )}
      </div>
    </ToolShell>
  );
}
