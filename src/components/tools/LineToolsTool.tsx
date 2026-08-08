import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function LineToolsTool() {
  const tool = tools.find((t) => t.slug === "line-tools")!;
  const [input, setInput] = useState("");
  const [sort, setSort] = useState<"none" | "asc" | "desc" | "length">("asc");
  const [dedupe, setDedupe] = useState(true);
  const [trim, setTrim] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(true);
  const [reverse, setReverse] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const output = useMemo(() => {
    let lines = input.split(/\r?\n/);
    if (trim) lines = lines.map((l) => l.trim());
    if (dropEmpty) lines = lines.filter((l) => l.length > 0);
    if (dedupe) {
      const seen = new Set<string>();
      lines = lines.filter((l) => {
        const key = caseInsensitive ? l.toLowerCase() : l;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    if (sort === "asc") lines.sort((a, b) => (caseInsensitive ? a.toLowerCase().localeCompare(b.toLowerCase()) : a.localeCompare(b)));
    else if (sort === "desc") lines.sort((a, b) => (caseInsensitive ? b.toLowerCase().localeCompare(a.toLowerCase()) : b.localeCompare(a)));
    else if (sort === "length") lines.sort((a, b) => a.length - b.length);
    if (reverse) lines.reverse();
    return lines.join("\n");
  }, [input, sort, dedupe, trim, dropEmpty, reverse, caseInsensitive]);

  const inCount = input ? input.split(/\r?\n/).length : 0;
  const outCount = output ? output.split(/\r?\n/).length : 0;

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste your list of lines into the input box.",
        "Pick sorting order and whether to remove duplicates, trim whitespace or drop blanks.",
        "Copy the cleaned result or download it as a .txt file — all processed in your browser.",
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block sm:col-span-2">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as "none" | "asc" | "desc" | "length")}
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm">
            <option value="none">Keep original order</option>
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
            <option value="length">By line length</option>
          </select>
        </label>
        {([
          ["Dedupe", dedupe, setDedupe],
          ["Trim", trim, setTrim],
          ["Drop empty", dropEmpty, setDropEmpty],
          ["Reverse", reverse, setReverse],
          ["Case-insensitive", caseInsensitive, setCaseInsensitive],
        ] as const).map(([label, v, s]) => (
          <label key={label} className="flex items-center gap-2 pt-6">
            <input type="checkbox" checked={v} onChange={(e) => s(e.target.checked)} />
            <span className="font-mono text-xs">{label}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Input</span>
            <span className="font-mono text-[11px] text-graphite/60">{inCount} lines</span>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14} placeholder={"apple\nbanana\napple\ncherry"}
            className="block w-full rounded-md border border-line bg-white p-3 font-mono text-sm focus:border-ink focus:outline-none" />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Output</span>
            <span className="font-mono text-[11px] text-graphite/60">{outCount} lines</span>
          </div>
          <textarea value={output} readOnly rows={14}
            className="block w-full rounded-md border border-line bg-paper-2 p-3 font-mono text-sm" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={async () => { await navigator.clipboard.writeText(output); setStatus({ kind: "success", message: "Copied." }); }}>
          <Copy className="mr-2 h-4 w-4" />Copy output
        </GhostButton>
        <GhostButton onClick={() => downloadBlob(new Blob([output], { type: "text/plain" }), "lines.txt")}>
          Download .txt
        </GhostButton>
      </div>
    </ToolShell>
  );
}
