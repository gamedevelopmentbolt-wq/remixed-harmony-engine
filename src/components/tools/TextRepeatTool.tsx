import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

export function TextRepeatTool() {
  const tool = tools.find((t) => t.slug === "text-repeat")!;
  const [text, setText] = useState("");
  const [times, setTimes] = useState(5);
  const [separator, setSeparator] = useState("\\n");
  const [reverse, setReverse] = useState(false);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const output = useMemo(() => {
    const sep = separator.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    const src = reverse ? [...text].reverse().join("") : text;
    return Array.from({ length: Math.max(0, Math.min(100000, times)) }, () => src).join(sep);
  }, [text, times, separator, reverse]);

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Type or paste the text you want to repeat.",
        "Choose how many times to repeat it and what separator to use between copies.",
        "Optionally reverse each copy — everything runs locally.",
      ]}>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Text</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
          className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm" />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label><span className="font-mono text-xs uppercase tracking-wider">Repeat times</span>
          <input type="number" value={times} min={1} max={100000} onChange={(e) => setTimes(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label><span className="font-mono text-xs uppercase tracking-wider">Separator (\n or \t OK)</span>
          <input value={separator} onChange={(e) => setSeparator(e.target.value)} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input type="checkbox" checked={reverse} onChange={(e) => setReverse(e.target.checked)} />
          <span className="font-mono text-xs">Reverse each copy</span>
        </label>
      </div>
      <textarea value={output} readOnly rows={12} className="block w-full rounded-md border border-line bg-paper-2 p-3 font-mono text-sm" />
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={async () => { await navigator.clipboard.writeText(output); setStatus({ kind: "success", message: "Copied." }); }}>
          <Copy className="mr-2 h-4 w-4" />Copy
        </GhostButton>
        <span className="font-mono text-[11px] text-graphite/60 self-center">{output.length.toLocaleString()} characters</span>
      </div>
    </ToolShell>
  );
}
