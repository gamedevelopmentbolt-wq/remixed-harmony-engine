import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

function slugify(input: string, sep: string, lower: boolean, strict: boolean) {
  let s = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  if (lower) s = s.toLowerCase();
  if (strict) s = s.replace(/[^a-zA-Z0-9]+/g, sep);
  else s = s.replace(/[\s_/\\]+/g, sep).replace(/[^\p{L}\p{N}-]+/gu, sep);
  return s.replace(new RegExp(`${sep}+`, "g"), sep).replace(new RegExp(`^${sep}|${sep}$`, "g"), "");
}

export function SlugifyTool() {
  const tool = tools.find((t) => t.slug === "slugify")!;
  const [input, setInput] = useState("");
  const [sep, setSep] = useState("-");
  const [lower, setLower] = useState(true);
  const [strict, setStrict] = useState(true);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const output = useMemo(() =>
    input.split(/\r?\n/).map((l) => slugify(l, sep, lower, strict)).join("\n"),
    [input, sep, lower, strict]);

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Paste one or more titles or phrases — one per line.",
        "Choose the separator (hyphen or underscore), lowercase and strict ASCII options.",
        "Copy the resulting URL-safe slugs, one per line.",
      ]}>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Separator</span>
          <select value={sep} onChange={(e) => setSep(e.target.value)}
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm">
            <option value="-">Hyphen ( - )</option>
            <option value="_">Underscore ( _ )</option>
            <option value=".">Dot ( . )</option>
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} />
          <span className="font-mono text-xs">Lowercase</span>
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} />
          <span className="font-mono text-xs">Strict ASCII</span>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12}
          placeholder="How to compress a PDF without losing quality"
          className="block w-full rounded-md border border-line bg-white p-3 font-mono text-sm focus:border-ink focus:outline-none" />
        <textarea value={output} readOnly rows={12}
          className="block w-full rounded-md border border-line bg-paper-2 p-3 font-mono text-sm" />
      </div>
      <GhostButton onClick={async () => { await navigator.clipboard.writeText(output); setStatus({ kind: "success", message: "Copied." }); }}>
        <Copy className="mr-2 h-4 w-4" />Copy slugs
      </GhostButton>
    </ToolShell>
  );
}
