import { useMemo, useState } from "react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

type Op = { kind: "same" | "add" | "del"; text: string };

function diffLines(a: string[], b: string[]): Op[] {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: Op[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { out.push({ kind: "same", text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ kind: "del", text: a[i] }); i++; }
    else { out.push({ kind: "add", text: b[j] }); j++; }
  }
  while (i < m) out.push({ kind: "del", text: a[i++] });
  while (j < n) out.push({ kind: "add", text: b[j++] });
  return out;
}

export function TextDiffTool() {
  const tool = tools.find((t) => t.slug === "text-diff")!;
  const [a, setA] = useState("The quick brown fox\njumps over the lazy dog.\nEnd.");
  const [b, setB] = useState("The quick red fox\njumps over the lazy dog.\nGoodbye.");

  const ops = useMemo(() => diffLines(a.split("\n"), b.split("\n")), [a, b]);
  const stats = useMemo(() => {
    let add = 0, del = 0, same = 0;
    for (const o of ops) {
      if (o.kind === "add") add++;
      else if (o.kind === "del") del++;
      else same++;
    }
    return { add, del, same };
  }, [ops]);

  return (
    <ToolShell
      tool={tool}
      howItWorks={[
        "Paste the original text on the left and the changed version on the right.",
        "Added lines appear in green, removed lines in red, unchanged in gray.",
        "Diff runs entirely in your browser — nothing is transmitted.",
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Original</span>
          <textarea value={a} onChange={(e) => setA(e.target.value)} rows={10} spellCheck={false}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none" />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Changed</span>
          <textarea value={b} onChange={(e) => setB(e.target.value)} rows={10} spellCheck={false}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none" />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-wider">
        <span className="rounded-full bg-workshop/10 px-3 py-1 text-workshop">+{stats.add} added</span>
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">−{stats.del} removed</span>
        <span className="rounded-full bg-line px-3 py-1 text-graphite">{stats.same} unchanged</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="max-h-[28rem] overflow-auto">
          <table className="w-full font-mono text-xs">
            <tbody>
              {ops.map((o, i) => (
                <tr key={i} className={
                  o.kind === "add" ? "bg-workshop/10" :
                  o.kind === "del" ? "bg-destructive/10" : ""
                }>
                  <td className="w-8 select-none px-2 py-1 text-right text-graphite/50">
                    {o.kind === "add" ? "+" : o.kind === "del" ? "−" : " "}
                  </td>
                  <td className="whitespace-pre-wrap px-2 py-1 text-ink">{o.text || " "}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolShell>
  );
}
