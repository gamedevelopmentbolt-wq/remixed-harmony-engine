import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

function makeUuidV4(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10, 16).join("")}`;
}

export function UuidGeneratorTool() {
  const tool = tools.find((t) => t.slug === "uuid-generator")!;
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 5 }, makeUuidV4));
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const format = (s: string) => {
    let x = noHyphens ? s.replace(/-/g, "") : s;
    return upper ? x.toUpperCase() : x;
  };
  const rendered = ids.map(format);

  const gen = () => setIds(Array.from({ length: Math.max(1, Math.min(1000, count)) }, makeUuidV4));

  const copyAll = async () => {
    await navigator.clipboard.writeText(rendered.join("\n"));
    setStatus({ kind: "success", message: "Copied all." });
  };
  const download = () => downloadBlob(new Blob([rendered.join("\n")], { type: "text/plain" }), "uuids.txt");
  const copyOne = async (v: string) => {
    await navigator.clipboard.writeText(v);
    setStatus({ kind: "success", message: `Copied ${v.slice(0, 8)}…` });
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Choose how many UUID v4 identifiers you need — 1 to 1000.",
        "IDs are generated in your browser using crypto.randomUUID (RFC 4122 v4).",
        "Copy them individually, copy all, or download them as a .txt file.",
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Count</span>
          <input type="number" min={1} max={1000} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm focus:border-ink focus:outline-none" />
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          <span className="font-mono text-xs">Uppercase</span>
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input type="checkbox" checked={noHyphens} onChange={(e) => setNoHyphens(e.target.checked)} />
          <span className="font-mono text-xs">Remove hyphens</span>
        </label>
        <div className="flex items-end">
          <PrimaryButton onClick={gen} className="!h-11 !min-w-0"><RefreshCw className="h-4 w-4" />Generate</PrimaryButton>
        </div>
      </div>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {rendered.map((v, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-2">
            <span className="w-8 shrink-0 font-mono text-[11px] text-graphite/60">{String(i + 1).padStart(2, "0")}</span>
            <code className="min-w-0 flex-1 truncate font-mono text-sm text-ink">{v}</code>
            <button type="button" onClick={() => copyOne(v)}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-3 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink">
              <Copy className="h-3.5 w-3.5" />Copy
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={copyAll}>Copy all</GhostButton>
        <GhostButton onClick={download}>Download .txt</GhostButton>
      </div>
    </ToolShell>
  );
}
