import { useState } from "react";
import { Copy } from "lucide-react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { Dropzone } from "./Dropzone";
import { downloadBlob, formatBytes } from "@/lib/tool-utils";

export function ImageToBase64Tool() {
  const tool = tools.find((t) => t.slug === "image-to-base64")!;
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [dataUrl, setDataUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const encode = async (file: File) => {
    setStatus({ kind: "working", message: "Encoding…" });
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result);
      setDataUrl(s);
      setPreview(s);
      setStatus({ kind: "success", message: `Encoded ${formatBytes(file.size)}.` });
    };
    reader.onerror = () => setStatus({ kind: "error", message: "Read failed." });
    reader.readAsDataURL(file);
  };

  const decode = () => {
    try {
      let s = dataUrl.trim();
      let mime = "image/png";
      let b64 = s;
      const m = s.match(/^data:([^;]+);base64,(.+)$/);
      if (m) { mime = m[1]; b64 = m[2]; }
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const ext = mime.split("/")[1] || "bin";
      downloadBlob(blob, `image.${ext}`);
      setPreview(URL.createObjectURL(blob));
      setStatus({ kind: "success", message: `Decoded ${formatBytes(blob.size)}.` });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Decode failed." });
    }
  };

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Choose Encode (image → base64) or Decode (base64 → image).",
        "Drop your image or paste a data-URL / base64 string.",
        "Copy the base64 for use in CSS/HTML data-URLs or download the decoded image.",
      ]}>
      <div className="flex gap-2">
        {(["encode", "decode"] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setDataUrl(""); setPreview(null); }}
            aria-pressed={mode === m}
            className={"inline-flex h-8 items-center rounded-full border px-3 font-mono text-[11px] uppercase tracking-wider " +
              (mode === m ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}>
            {m === "encode" ? "Image → Base64" : "Base64 → Image"}
          </button>
        ))}
      </div>

      {mode === "encode" ? (
        <Dropzone onFiles={(fs) => fs[0] && encode(fs[0])}
          accept="image/*" multiple={false} />
      ) : (
        <textarea value={dataUrl} onChange={(e) => setDataUrl(e.target.value)} rows={8}
          placeholder="data:image/png;base64,iVBORw0KGgo..." spellCheck={false}
          className="block w-full rounded-md border border-line bg-white p-3 font-mono text-xs" />
      )}

      {mode === "encode" && dataUrl && (
        <>
          <textarea value={dataUrl} readOnly rows={8} className="block w-full rounded-md border border-line bg-paper-2 p-3 font-mono text-xs" />
          <div className="flex flex-wrap gap-3">
            <GhostButton onClick={async () => { await navigator.clipboard.writeText(dataUrl); setStatus({ kind: "success", message: "Copied." }); }}>
              <Copy className="mr-2 h-4 w-4" />Copy data URL
            </GhostButton>
          </div>
        </>
      )}

      {mode === "decode" && (
        <GhostButton onClick={decode} disabled={!dataUrl}>Decode &amp; download</GhostButton>
      )}

      {preview && (
        <div className="rounded-xl border border-line bg-white p-3">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-graphite/60">Preview</p>
          <img src={preview} alt="preview" className="max-h-64 max-w-full" />
        </div>
      )}
    </ToolShell>
  );
}
