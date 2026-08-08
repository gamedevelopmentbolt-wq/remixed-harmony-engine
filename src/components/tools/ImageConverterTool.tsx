import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

type Fmt = "jpeg" | "png" | "webp";
const MIME: Record<Fmt, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const EXT: Record<Fmt, string> = { jpeg: "jpg", png: "png", webp: "webp" };

export function ImageConverterTool() {
  const tool = tools.find((t) => t.slug === "image-converter")!;
  const [files, setFiles] = useState<File[]>([]);
  const [target, setTarget] = useState<Fmt>("webp");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const add = (fs: File[]) => setFiles((prev) => [...prev, ...fs.filter((f) => f.type.startsWith("image/"))]);
  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const run = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Converting…", progress: 3 });
      const outs: { name: string; blob: Blob }[] = [];
      for (let i = 0; i < files.length; i++) {
        setStatus({ kind: "working", message: `Converting ${files[i].name}…`, progress: 5 + (i / files.length) * 90 });
        const dataUrl = await readFileAsDataURL(files[i]);
        const img = await loadImage(dataUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unsupported");
        if (target === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob((b) => res(b), MIME[target], target === "png" ? undefined : 0.92),
        );
        if (!blob) throw new Error("toBlob failed");
        const base = files[i].name.replace(/\.[^.]+$/, "");
        outs.push({ name: `${base}.${EXT[target]}`, blob });
      }

      if (outs.length === 1) {
        downloadBlob(outs[0].blob, outs[0].name);
      } else {
        setStatus({ kind: "working", message: "Bundling ZIP…", progress: 97 });
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        outs.forEach((o) => zip.file(o.name, o.blob));
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, `converted-${target}.zip`);
      }
      setStatus({ kind: "success", message: `Converted ${outs.length} image(s) to ${target.toUpperCase()}.` });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not convert one or more images." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop your images — JPG, PNG or WEBP.",
        "Pick the output format you want.",
        "Each image is redrawn on a canvas and exported in the new format.",
      ]}
    >
      <Dropzone accept="image/*" onFiles={add} hint="JPG, PNG or WEBP" />
      <FileList files={files} onRemove={remove} />
      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Output format</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(MIME) as Fmt[]).map((k) => (
            <label
              key={k}
              className={
                "cursor-pointer rounded-xl border p-3 text-center text-sm transition " +
                (target === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")
              }
            >
              <input type="radio" name="fmt" value={k} checked={target === k} onChange={() => setTarget(k)} className="sr-only" />
              <p className="font-mono text-sm font-bold uppercase tracking-wider">{k}</p>
            </label>
          ))}
        </div>
      </fieldset>
      <PrimaryButton onClick={run} disabled={files.length === 0 || status.kind === "working"}>
        Convert
      </PrimaryButton>
    </ToolShell>
  );
}
