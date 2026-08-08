import { useEffect, useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

const SAMPLE = `name: EasyFileMagic
version: 1.0
tools:
  - merge-pdf
  - compress-pdf
  - ocr
meta:
  free: true
  signup: false
`;

export function YamlFormatterTool() {
  const tool = tools.find((t) => t.slug === "yaml-formatter")!;
  const [src, setSrc] = useState(SAMPLE);
  const [out, setOut] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const yaml = await import("js-yaml");
        const parsed = yaml.load(src);
        const dumped = yaml.dump(parsed, { indent: 2, lineWidth: 100, noRefs: true, sortKeys: false });
        if (!cancel) {
          setOut(dumped);
          setStatus({ kind: "idle" });
        }
      } catch (err) {
        if (!cancel) {
          setOut("");
          setStatus({ kind: "error", message: err instanceof Error ? err.message : "Invalid YAML." });
        }
      }
    })();
    return () => { cancel = true; };
  }, [src]);

  const copy = async () => {
    await navigator.clipboard.writeText(out);
    setStatus({ kind: "success", message: "Copied YAML." });
  };
  const download = () => downloadBlob(new Blob([out], { type: "text/yaml" }), "data.yaml");

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste YAML on the left — even sloppy indentation is fine.",
        "The formatter parses, validates and re-dumps it with clean 2-space indentation.",
        "Syntax errors surface with the exact line — copy or download the formatted output.",
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">YAML in</span>
          <textarea
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            rows={16}
            spellCheck={false}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Formatted / validated</span>
          <textarea
            value={out}
            readOnly
            rows={16}
            className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-[11px] text-graphite"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={copy} disabled={!out}>Copy YAML</GhostButton>
        <GhostButton onClick={download} disabled={!out}>Download .yaml</GhostButton>
      </div>
    </ToolShell>
  );
}