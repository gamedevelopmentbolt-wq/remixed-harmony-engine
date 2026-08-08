import { useState } from "react";
import { Copy } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

export function QrScannerTool() {
  const tool = tools.find((t) => t.slug === "qr-scanner")!;
  const [result, setResult] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = async (fs: File[]) => {
    const f = fs[0];
    if (!f) return;
    setStatus({ kind: "working", message: "Scanning…" });
    setResult("");
    try {
      const url = URL.createObjectURL(f);
      setPreview(url);
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      const MAX = 1200;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const jsQR = (await import("jsqr")).default;
      const code = jsQR(data.data, data.width, data.height);
      if (!code) {
        setStatus({ kind: "error", message: "No QR code detected in this image." });
        return;
      }
      setResult(code.data);
      setStatus({ kind: "success", message: "QR decoded." });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setStatus({ kind: "success", message: "Copied." });
  };

  const isUrl = /^https?:\/\//i.test(result);

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop or upload an image containing a QR code (PNG, JPG, WebP, screenshot).",
        "The image is decoded locally in your browser — nothing is uploaded.",
        "Copy the decoded text, or click the link if it's a URL.",
      ]}
    >
      <Dropzone accept="image/*" multiple={false} onFiles={onFiles} hint="Drop a QR image" />
      {preview && (
        <img src={preview} alt="Scanned" className="max-h-64 rounded-lg border border-line" />
      )}
      {result && (
        <>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Decoded content</span>
            <textarea
              value={result}
              readOnly
              rows={4}
              className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-xs text-graphite"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <GhostButton onClick={copy}><Copy className="h-4 w-4" />Copy</GhostButton>
            {isUrl && (
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-md border border-ink bg-white px-5 font-mono text-sm font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
              >
                Open link →
              </a>
            )}
          </div>
        </>
      )}
    </ToolShell>
  );
}
