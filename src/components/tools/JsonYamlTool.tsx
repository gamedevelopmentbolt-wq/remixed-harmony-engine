import { useState } from "react";
import * as yaml from "js-yaml";
import { ArrowLeftRight, Copy } from "lucide-react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function JsonYamlTool() {
  const tool = tools.find((t) => t.slug === "json-yaml")!;
  const [mode, setMode] = useState<"j2y" | "y2j">("j2y");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const convert = () => {
    try {
      if (mode === "j2y") {
        const obj = JSON.parse(input);
        setOutput(yaml.dump(obj, { indent: 2, lineWidth: 100 }));
      } else {
        const obj = yaml.load(input);
        setOutput(JSON.stringify(obj, null, 2));
      }
      setStatus({ kind: "success", message: "Converted." });
    } catch (e) {
      setOutput("");
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Conversion failed." });
    }
  };

  const swap = () => {
    setMode(mode === "j2y" ? "y2j" : "j2y");
    setInput(output);
    setOutput(input);
  };

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Paste JSON or YAML into the input box.",
        "Pick a direction — JSON→YAML or YAML→JSON — then press Convert.",
        "Copy the result or download it. All parsing runs locally in your browser.",
      ]}>
      <div className="flex flex-wrap gap-2">
        {(["j2y", "y2j"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={"inline-flex h-8 items-center rounded-full border px-3 font-mono text-[11px] uppercase tracking-wider " +
              (mode === m ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}>
            {m === "j2y" ? "JSON → YAML" : "YAML → JSON"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16}
          placeholder={mode === "j2y" ? '{"name":"Ada","langs":["js","py"]}' : "name: Ada\nlangs:\n  - js\n  - py"}
          className="block w-full rounded-md border border-line bg-white p-3 font-mono text-xs focus:border-ink focus:outline-none" />
        <textarea value={output} readOnly rows={16}
          className="block w-full rounded-md border border-line bg-paper-2 p-3 font-mono text-xs" />
      </div>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={convert}>Convert</PrimaryButton>
        <GhostButton onClick={swap}><ArrowLeftRight className="mr-2 h-4 w-4" />Swap direction</GhostButton>
        <GhostButton onClick={async () => { await navigator.clipboard.writeText(output); setStatus({ kind: "success", message: "Copied." }); }}>
          <Copy className="mr-2 h-4 w-4" />Copy
        </GhostButton>
        <GhostButton onClick={() => downloadBlob(new Blob([output], { type: "text/plain" }),
          mode === "j2y" ? "output.yaml" : "output.json")}>
          Download
        </GhostButton>
      </div>
    </ToolShell>
  );
}
