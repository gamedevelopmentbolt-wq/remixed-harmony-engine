import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, formatBytes } from "@/lib/tool-utils";

export function ZipFilesTool() {
  const tool = tools.find((t) => t.slug === "zip-files")!;
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("archive");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const add = (fs: File[]) => setFiles((prev) => [...prev, ...fs]);
  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const run = async () => {
    if (files.length === 0) return;
    try {
      setStatus({ kind: "working", message: "Zipping…", progress: 3 });
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      // De-duplicate names by appending (n)
      const used = new Map<string, number>();
      files.forEach((f) => {
        let n = f.name;
        if (used.has(n)) {
          const c = (used.get(n) ?? 0) + 1;
          used.set(n, c);
          const dot = n.lastIndexOf(".");
          n = dot > 0 ? `${n.slice(0, dot)} (${c})${n.slice(dot)}` : `${n} (${c})`;
        } else {
          used.set(n, 0);
        }
        zip.file(n, f);
      });
      const blob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        (m) => setStatus({ kind: "working", message: "Compressing…", progress: Math.max(5, m.percent) }),
      );
      const filename = (name.trim() || "archive").replace(/\.zip$/i, "") + ".zip";
      downloadBlob(blob, filename);
      const total = files.reduce((s, f) => s + f.size, 0);
      setStatus({
        kind: "success",
        message: `Zipped ${files.length} file(s) · ${formatBytes(total)} → ${formatBytes(blob.size)} · ${filename}.`,
      });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not create ZIP." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop any files — mix documents, images, whatever you need.",
        "Give the archive a name.",
        "A DEFLATE-compressed .zip is built locally and downloaded.",
      ]}
    >
      <Dropzone onFiles={add} hint="Any file type" />
      <FileList files={files} onRemove={remove} />
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Archive name</span>
        <div className="mt-2 flex items-center rounded-md border border-line bg-white focus-within:border-ink">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 flex-1 bg-transparent px-3 font-mono text-sm text-ink focus:outline-none"
            placeholder="archive"
          />
          <span className="pr-3 font-mono text-sm text-graphite/60">.zip</span>
        </div>
      </label>
      <PrimaryButton onClick={run} disabled={files.length === 0 || status.kind === "working"}>
        Create ZIP
      </PrimaryButton>
    </ToolShell>
  );
}
