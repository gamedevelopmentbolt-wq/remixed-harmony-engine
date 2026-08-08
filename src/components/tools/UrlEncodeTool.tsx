import { useState } from "react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

type Dir = "encode" | "decode";
type Scope = "component" | "full";

export function UrlEncodeTool() {
  const tool = tools.find((t) => t.slug === "url-encode")!;
  const [dir, setDir] = useState<Dir>("encode");
  const [scope, setScope] = useState<Scope>("component");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const run = () => {
    try {
      if (dir === "encode") {
        setOutput(scope === "component" ? encodeURIComponent(input) : encodeURI(input));
      } else {
        setOutput(scope === "component" ? decodeURIComponent(input) : decodeURI(input));
      }
      setStatus({ kind: "success", message: dir === "encode" ? "Encoded." : "Decoded." });
    } catch (err) {
      setOutput("");
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setStatus({ kind: "success", message: "Copied." });
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Pick Encode or Decode, then choose Component (a single value) or Full URL.",
        "Paste your string and click the button — percent-encoding runs locally.",
        "Copy the result. Nothing is uploaded.",
      ]}
    >
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-line">
          {(["encode", "decode"] as Dir[]).map((k) => (
            <button key={k} type="button" onClick={() => setDir(k)}
              className={"px-4 py-2 font-mono text-xs uppercase tracking-wider " + (dir === k ? "bg-ink text-paper" : "bg-white text-graphite hover:bg-paper-2")}>
              {k}
            </button>
          ))}
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-line">
          {(["component", "full"] as Scope[]).map((k) => (
            <button key={k} type="button" onClick={() => setScope(k)}
              className={"px-4 py-2 font-mono text-xs uppercase tracking-wider " + (scope === k ? "bg-ink text-paper" : "bg-white text-graphite hover:bg-paper-2")}>
              {k === "component" ? "Component" : "Full URL"}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder={dir === "encode" ? "https://example.com/search?q=hello world" : "https%3A%2F%2Fexample.com"}
        spellCheck={false}
        className="block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
      />
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>{dir === "encode" ? "Encode" : "Decode"}</PrimaryButton>
        {output && <GhostButton onClick={copy}>Copy</GhostButton>}
      </div>
      <textarea
        value={output}
        readOnly rows={5}
        placeholder="Result appears here"
        className="block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-xs text-graphite"
      />
    </ToolShell>
  );
}
