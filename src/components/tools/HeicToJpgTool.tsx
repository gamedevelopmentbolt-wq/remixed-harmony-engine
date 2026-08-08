import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Fmt = "image/jpeg" | "image/png";

export function HeicToJpgTool() {
  const tool = tools.find((t) => t.slug === "heic-to-jpg")!;
  const [files, setFiles] = useState<File[]>([]);
  const [fmt, setFmt] = useState<Fmt>("image/jpeg");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const add = (fs: File[]) =>
    setFiles((prev) => [
      ...prev,
      ...fs.filter((f) => /\.hei[cf]$/i.test(f.name) || f.type === "image/heic" || f.type === "image/heif"),
    ]);
  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const run = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Loading converter…", progress: 3 });
      const heic2any = (await import("heic2any")).default;
      const out: { name: string; blob: Blob }[] = [];
      for (let i = 0; i < files.length; i++) {
        setStatus({ kind: "working", message: `Converting ${files[i].name}…`, progress: 5 + (i / files.length) * 90 });
        const result = await heic2any({ blob: files[i], toType: fmt, quality: 0.92 });
        const blob = Array.isArray(result) ? result[0] : result;
        const ext = fmt === "image/jpeg" ? "jpg" : "png";
        out.push({ name: files[i].name.replace(/\.hei[cf]$/i, "") + "." + ext, blob });
      }
      if (out.length === 1) {
        downloadBlob(out[0].blob, out[0].name);
      } else {
        setStatus({ kind: "working", message: "Bundling ZIP…", progress: 96 });
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        out.forEach((o) => zip.file(o.name, o.blob));
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, "heic-converted.zip");
      }
      setStatus({ kind: "success", message: `Converted ${files.length} file${files.length > 1 ? "s" : ""}.` });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not convert. Make sure the file is a valid HEIC/HEIF image. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop one or more Apple HEIC or HEIF photos.",
        "Pick JPG or PNG output.",
        "Each photo is decoded and re-encoded in your browser — nothing leaves your device.",
      ]}
    >
      <Dropzone accept=".heic,.heif,image/heic,image/heif" onFiles={add} hint="HEIC or HEIF images" />
      <FileList files={files} onRemove={remove} />
      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Output format</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["image/jpeg", "image/png"] as Fmt[]).map((f) => (
            <label
              key={f}
              className={"cursor-pointer rounded-xl border p-3 text-center text-sm transition " + (fmt === f ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}
            >
              <input type="radio" name="fmt" value={f} checked={fmt === f} onChange={() => setFmt(f)} className="sr-only" />
              <p className="font-mono text-sm font-bold">{f === "image/jpeg" ? "JPG" : "PNG"}</p>
              <p className={"mt-1 text-[10px] uppercase tracking-wider " + (fmt === f ? "text-paper/70" : "text-graphite/60")}>
                {f === "image/jpeg" ? "smaller · lossy" : "transparent · lossless"}
              </p>
            </label>
          ))}
        </div>
      </fieldset>
      <PrimaryButton onClick={run} disabled={files.length === 0 || status.kind === "working"}>
        Convert HEIC
      </PrimaryButton>
    </ToolShell>
  );
}
