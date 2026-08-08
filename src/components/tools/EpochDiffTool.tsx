import { useMemo, useState } from "react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

function parseInput(v: string): Date | null {
  const t = v.trim();
  if (!t) return null;
  if (/^\d+$/.test(t)) {
    const n = Number(t);
    return new Date(n > 1e12 ? n : n * 1000);
  }
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

function humanize(ms: number): string {
  const neg = ms < 0; ms = Math.abs(ms);
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return (neg ? "-" : "") + parts.join(" ");
}

export function EpochDiffTool() {
  const tool = tools.find((t) => t.slug === "epoch-diff")!;
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = useMemo(() => {
    const da = parseInput(a);
    const db = parseInput(b);
    if (!da || !db) return null;
    const diffMs = db.getTime() - da.getTime();
    return {
      da, db, diffMs,
      seconds: Math.floor(diffMs / 1000),
      minutes: (diffMs / 60000).toFixed(2),
      hours: (diffMs / 3600000).toFixed(2),
      days: (diffMs / 86400000).toFixed(2),
      weeks: (diffMs / (86400000 * 7)).toFixed(2),
      months: (diffMs / (86400000 * 30.4375)).toFixed(2),
      years: (diffMs / (86400000 * 365.25)).toFixed(3),
      human: humanize(diffMs),
    };
  }, [a, b]);

  return (
    <ToolShell tool={tool}
      howItWorks={[
        "Enter two dates or Unix timestamps in seconds or milliseconds.",
        "The tool computes the duration in seconds, minutes, hours, days, weeks, months and years.",
        "A humanised summary makes it easy to paste into reports or bug tickets.",
      ]}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Start (date or epoch)</span>
          <input value={a} onChange={(e) => setA(e.target.value)} placeholder="2024-01-01 or 1704067200"
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">End (date or epoch)</span>
          <input value={b} onChange={(e) => setB(e.target.value)} placeholder="now or 2026-07-25"
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
      </div>
      <button onClick={() => setB(new Date().toISOString())} className="rounded border border-line bg-white px-3 py-1 font-mono text-xs">Set end to now</button>
      {result && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Human", result.human], ["Seconds", result.seconds],
            ["Minutes", result.minutes], ["Hours", result.hours],
            ["Days", result.days], ["Weeks", result.weeks],
            ["Months", result.months], ["Years", result.years],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-xl border border-line bg-white p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal">{l}</p>
              <p className="mt-1 font-mono text-base font-bold text-ink break-all">{v}</p>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  );
}
