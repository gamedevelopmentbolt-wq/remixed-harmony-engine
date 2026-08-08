import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { loadPipeline } from "@/lib/hf-transformers";

export function AiImageCaptionTool() {
  const tool = tools.find((t) => t.slug === "ai-image-caption")!;
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("image/"));
    if (!f) return setStatus({ kind: "error", message: "Please choose a JPG, PNG or WebP image." });
    setFile(f);
    setPreviewSrc(URL.createObjectURL(f));
    setCaption("");
    setStatus({ kind: "idle" });
  };

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading model…", progress: 5 });
      const pipe = await loadPipeline<(input: string) => Promise<Array<{ generated_text: string }>>>(
        "image-to-text",
        "Xenova/vit-gpt2-image-captioning",
        (m, p) => setStatus({ kind: "working", message: m, progress: p }),
      );
      setStatus({ kind: "working", message: "Analyzing image…", progress: 90 });
      const out = await pipe(previewSrc);
      const text = out?.[0]?.generated_text?.trim() ?? "";
      setCaption(text);
      setStatus({ kind: "success", message: "Caption generated." });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a photo — JPG, PNG or WebP.",
        "First run downloads the open-source ViT-GPT2 vision-language model (~180 MB), cached after that.",
        "The caption is generated locally in your browser — the image never leaves your device.",
      ]}
    >
      {!file ? (
        <Dropzone accept="image/*" multiple={false} onFiles={onFiles} hint="JPG, PNG or WebP" />
      ) : (
        <>
          <FileList files={[file]} onRemove={() => { setFile(null); setPreviewSrc(""); setCaption(""); }} />
          {previewSrc && <img src={previewSrc} alt="Preview" className="mx-auto max-h-72 rounded-md border border-line" />}
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={run} disabled={status.kind === "working"} loading={status.kind === "working"}>
              Generate caption
            </PrimaryButton>
            <GhostButton onClick={() => { setFile(null); setPreviewSrc(""); setCaption(""); }}>Choose another</GhostButton>
          </div>
          {caption && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Caption</p>
              <div className="mt-2 rounded-lg border border-line bg-paper-2 p-4 text-sm leading-relaxed text-ink">{caption}</div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(caption)}
                className="mt-3 font-mono text-[11px] uppercase tracking-widest text-signal hover:underline"
              >
                Copy
              </button>
            </div>
          )}
        </>
      )}
    </ToolShell>
  );
}