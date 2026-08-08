import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Tab = "text" | "file";
type Dir = "encode" | "decode";

function bytesToBase64(bytes: Uint8Array): string {
  // Chunked to avoid call-stack overflow on large files.
  let s = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(s);
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s+/g, "");
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function Base64Tool() {
  const tool = tools.find((t) => t.slug === "base64")!;
  const [tab, setTab] = useState<Tab>("text");
  const [dir, setDir] = useState<Dir>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const runText = () => {
    try {
      if (dir === "encode") {
        const bytes = new TextEncoder().encode(input);
        setOutput(bytesToBase64(bytes));
      } else {
        const bytes = base64ToBytes(input);
        setOutput(new TextDecoder().decode(bytes));
      }
      setStatus({ kind: "success", message: dir === "encode" ? "Encoded." : "Decoded." });
    } catch (err) {
      setOutput("");
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  const runFileEncode = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Encoding…" });
      const bytes = new Uint8Array(await file.arrayBuffer());
      const b64 = bytesToBase64(bytes);
      setOutput(b64);
      setStatus({
        kind: "success",
        message: `Encoded ${bytes.length.toLocaleString()} bytes → ${b64.length.toLocaleString()} chars.`,
      });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  const downloadEncodedText = () => {
    if (!output || !file) return;
    downloadBlob(new Blob([output], { type: "text/plain" }), file.name + ".base64.txt");
  };

  const runFileDecode = () => {
    if (!input.trim()) {
      setStatus({ kind: "error", message: "Paste Base64 first." });
      return;
    }
    try {
      const bytes = base64ToBytes(input);
      const arrayBuffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;
      downloadBlob(new Blob([arrayBuffer], { type: "application/octet-stream" }), "decoded.bin");
      setStatus({ kind: "success", message: `Decoded ${bytes.length.toLocaleString()} bytes → decoded.bin` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Not valid Base64." });
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setStatus({ kind: "success", message: "Copied to clipboard." });
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Pick Text or File, then Encode or Decode.",
        "For text: type or paste, then click. For files: drop a file to encode, or paste Base64 to decode back into a file.",
        "Copy the result or download it. Everything runs locally.",
      ]}
    >
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-line">
          {(["text", "file"] as Tab[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setTab(k);
                setInput("");
                setOutput("");
                setFile(null);
                setStatus({ kind: "idle" });
              }}
              className={
                "px-4 py-2 font-mono text-xs uppercase tracking-wider " +
                (tab === k ? "bg-ink text-paper" : "bg-white text-graphite hover:bg-paper-2")
              }
            >
              {k === "text" ? "Text" : "File"}
            </button>
          ))}
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-line">
          {(["encode", "decode"] as Dir[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setDir(k);
                setOutput("");
              }}
              className={
                "px-4 py-2 font-mono text-xs uppercase tracking-wider " +
                (dir === k ? "bg-ink text-paper" : "bg-white text-graphite hover:bg-paper-2")
              }
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {tab === "text" && (
        <>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">
              {dir === "encode" ? "Text input" : "Base64 input"}
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={7}
              className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
              placeholder={dir === "encode" ? "hello world" : "aGVsbG8gd29ybGQ="}
              spellCheck={false}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={runText}>{dir === "encode" ? "Encode" : "Decode"}</PrimaryButton>
            {output && <GhostButton onClick={copy}>Copy</GhostButton>}
          </div>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Output</span>
            <textarea
              value={output}
              readOnly
              rows={7}
              className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-xs text-graphite"
              placeholder="Result appears here"
              spellCheck={false}
            />
          </label>
        </>
      )}

      {tab === "file" && dir === "encode" && (
        <>
          {!file ? (
            <Dropzone multiple={false} onFiles={(fs) => setFile(fs[0])} hint="Any file, encoded to Base64 text" />
          ) : (
            <FileList files={[file]} onRemove={() => { setFile(null); setOutput(""); }} />
          )}
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={runFileEncode} disabled={!file || status.kind === "working"}>
              Encode file
            </PrimaryButton>
            {output && (
              <>
                <GhostButton onClick={copy}>Copy Base64</GhostButton>
                <GhostButton onClick={downloadEncodedText}>Download .txt</GhostButton>
              </>
            )}
          </div>
          {output && (
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">
                Base64 output ({output.length.toLocaleString()} chars)
              </span>
              <textarea
                value={output.length > 200000 ? output.slice(0, 200000) + "\n… (truncated in preview — full data available via Copy/Download)" : output}
                readOnly
                rows={7}
                className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-[10px] text-graphite"
              />
            </label>
          )}
        </>
      )}

      {tab === "file" && dir === "decode" && (
        <>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Paste Base64</span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={9}
              className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-[10px] text-graphite focus:border-ink focus:outline-none"
              placeholder="Paste Base64 (with or without data: prefix)…"
              spellCheck={false}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={runFileDecode}>Decode to file</PrimaryButton>
          </div>
        </>
      )}
    </ToolShell>
  );
}