import { useRef, useState } from "react";
import { Dropzone } from "./Dropzone";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function RemoveBackgroundTool() {
  const tool = tools.find((t) => t.slug === "remove-background")!;
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const resultBlobRef = useRef<Blob | null>(null);

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("image/"));
    if (!f) return setStatus({ kind: "error", message: "Please choose a JPG or PNG image." });
    setFile(f);
    setOriginalUrl(URL.createObjectURL(f));
    setResultUrl("");
    resultBlobRef.current = null;
    setStatus({ kind: "idle" });
  };

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading background-removal model (first run downloads ~40 MB)…", progress: 5 });
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            setStatus({
              kind: "working",
              message: "Processing…",
              progress: 10 + (current / total) * 85,
            });
          }
        },
      });
      resultBlobRef.current = blob;
      setResultUrl(URL.createObjectURL(blob));
      setStatus({ kind: "success", message: "Done. Preview below — download when you're happy." });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Background removal failed. Try a smaller image or a different file." });
    }
  };

  const dl = () => {
    if (!resultBlobRef.current || !file) return;
    downloadBlob(resultBlobRef.current, file.name.replace(/\.[^.]+$/, "") + "-nobg.png");
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a JPG or PNG. The subject stays sharp; the background goes.",
        "An in-browser ML model runs on your device — nothing is uploaded to a server.",
        "Preview before/after side by side, then download a transparent PNG.",
      ]}
    >
      <div className="rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-signal">
        First run downloads a ~40 MB model over the network. Then processing runs offline.
      </div>
      {!file ? (
        <Dropzone accept="image/*" multiple={false} onFiles={onFiles} hint="One JPG or PNG image" />
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <figure className="rounded-xl border border-line bg-white p-3">
              <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                Before
              </figcaption>
              <img src={originalUrl} alt="Original" className="max-h-72 w-full object-contain" />
            </figure>
            <figure
              className="rounded-xl border border-line p-3"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
              }}
            >
              <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                After
              </figcaption>
              {resultUrl ? (
                <img src={resultUrl} alt="Result" className="max-h-72 w-full object-contain" />
              ) : (
                <div className="grid h-72 place-items-center font-mono text-xs text-graphite/60">
                  Click Remove background
                </div>
              )}
            </figure>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={run} disabled={status.kind === "working"}>
              Remove background
            </PrimaryButton>
            {resultUrl && (
              <GhostButton type="button" onClick={dl}>
                Download PNG
              </GhostButton>
            )}
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setOriginalUrl("");
                setResultUrl("");
                resultBlobRef.current = null;
              }}
              className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
            >
              Try another image
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
