import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

function secureInt(minInc: number, maxInc: number): number {
  const range = maxInc - minInc + 1;
  if (range <= 0) return minInc;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / range) * range;
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return minInc + (buf[0] % range);
  }
}

export function RandomNumberTool() {
  const tool = tools.find((t) => t.slug === "random-number")!;
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [unique, setUnique] = useState(false);
  const [nums, setNums] = useState<number[]>([]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const gen = () => {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const n = Math.max(1, Math.min(10000, count));
    if (unique && hi - lo + 1 < n) {
      setStatus({ kind: "error", message: "Range is smaller than the count — turn off Unique or widen the range." });
      return;
    }
    const out: number[] = [];
    if (unique) {
      const seen = new Set<number>();
      while (out.length < n) {
        const v = secureInt(lo, hi);
        if (!seen.has(v)) { seen.add(v); out.push(v); }
      }
    } else {
      for (let i = 0; i < n; i++) out.push(secureInt(lo, hi));
    }
    setNums(out);
    setStatus({ kind: "success", message: `Generated ${n} number${n === 1 ? "" : "s"}.` });
  };

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Set the minimum, maximum and how many random numbers you want (up to 10,000).",
        "Numbers are produced with crypto.getRandomValues for uniform, unbiased randomness.",
        "Copy or download the list — great for lotteries, sampling, testing and giveaways.",
      ]}>
      <div className="grid gap-3 sm:grid-cols-4">
        <label><span className="font-mono text-xs uppercase tracking-wider">Min</span>
          <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label><span className="font-mono text-xs uppercase tracking-wider">Max</span>
          <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label><span className="font-mono text-xs uppercase tracking-wider">Count</span>
          <input type="number" min={1} max={10000} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} />
          <span className="font-mono text-xs">Unique only</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={gen}><RefreshCw className="mr-2 h-4 w-4" />Generate</PrimaryButton>
        {nums.length > 0 && (<>
          <GhostButton onClick={async () => { await navigator.clipboard.writeText(nums.join("\n")); setStatus({ kind: "success", message: "Copied." }); }}>
            <Copy className="mr-2 h-4 w-4" />Copy
          </GhostButton>
          <GhostButton onClick={() => downloadBlob(new Blob([nums.join("\n")], { type: "text/plain" }), "random-numbers.txt")}>Download .txt</GhostButton>
        </>)}
      </div>
      {nums.length > 0 && (
        <div className="max-h-72 overflow-auto rounded-md border border-line bg-paper-2 p-3 font-mono text-sm">
          {nums.join(", ")}
        </div>
      )}
    </ToolShell>
  );
}
