import { useState } from "react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { Dropzone } from "./Dropzone";
import { downloadBlob, readFileAsText } from "@/lib/tool-utils";

type Mode = "pretty" | "minify";

interface ErrLoc {
  line: number;
  col: number;
  message: string;
}

function parseErrLocation(input: string, err: unknown): ErrLoc {
  const msg = err instanceof Error ? err.message : String(err);
  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const before = input.slice(0, pos);
    const line = (before.match(/\n/g) || []).length + 1;
    const col = pos - before.lastIndexOf("\n");
    return { line, col, message: msg };
  }
  const lineMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineMatch) return { line: Number(lineMatch[1]), col: Number(lineMatch[2]), message: msg };
  return { line: 1, col: 1, message: msg };
}

export function JsonFormatTool() {
  const tool = tools.find((t) => t.slug === "json-format")!;
  const [mode, setMode] = useState<Mode>("pretty");
  const [indent, setIndent] = useState(2);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFile = async (fs: File[]) => {
    const f = fs[0];
    if (!f) return;
    const text = await readFileAsText(f);
    setInput(text);
    setStatus({ kind: "idle" });
  };

  const run = () => {
    if (!input.trim()) {
      setStatus({ kind: "error", message: "Paste or upload some JSON first." });
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const out = mode === "pretty" ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed);
      setOutput(out);
      setStatus({
        kind: "success",
        message: `Valid JSON — ${mode === "pretty" ? "pretty-printed" : "minified"} (${out.length.toLocaleString()} chars).`,
      });
    } catch (err) {
      const loc = parseErrLocation(input, err);
      setOutput("");
      setStatus({
        kind: "error",
        message: `Invalid JSON at line ${loc.line}, column ${loc.col}: ${loc.message}`,
      });
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setStatus({ kind: "success", message: "Copied to clipboard." });
  };

  const download = () => {
    if (!output) return;
    downloadBlob(new Blob([output], { type: "application/json" }), "formatted.json");
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste JSON into the input, or drop a .json file.",
        "Pick pretty-print (with your indent size) or minify.",
        "Copy the result to your clipboard, or download it as a .json file.",
      ]}
    >
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-line">
          {(["pretty", "minify"] as Mode[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setMode(k)}
              className={
                "px-4 py-2 font-mono text-xs uppercase tracking-wider " +
                (mode === k ? "bg-ink text-paper" : "bg-white text-graphite hover:bg-paper-2")
              }
            >
              {k === "pretty" ? "Pretty print" : "Minify"}
            </button>
          ))}
        </div>
        {mode === "pretty" && (
          <label className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink">
            Indent
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded border border-line bg-white px-2 py-1 text-ink"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>Tab-ish (8)</option>
            </select>
          </label>
        )}
      </div>

      <Dropzone accept=".json,application/json" multiple={false} onFiles={onFile} hint="Or upload a .json file" />

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Input</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={9}
          className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
          placeholder='{"hello":"world","count":3,"tags":["a","b"]}'
          spellCheck={false}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>{mode === "pretty" ? "Format" : "Minify"}</PrimaryButton>
        {output && (
          <>
            <GhostButton onClick={copy}>Copy</GhostButton>
            <GhostButton onClick={download}>Download</GhostButton>
          </>
        )}
      </div>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Output</span>
        <textarea
          value={output}
          readOnly
          rows={9}
          className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-xs text-graphite"
          placeholder="Result appears here"
          spellCheck={false}
        />
      </label>
    </ToolShell>
  );
}