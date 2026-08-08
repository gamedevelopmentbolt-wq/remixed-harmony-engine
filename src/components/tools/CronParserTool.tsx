import { useMemo, useState } from "react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

const FIELD_NAMES = ["Minute", "Hour", "Day of month", "Month", "Day of week"] as const;
const RANGES: [number, number][] = [
  [0, 59], [0, 23], [1, 31], [1, 12], [0, 6],
];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function expandField(field: string, min: number, max: number): number[] | "*" | null {
  if (field === "*") return "*";
  const parts = field.split(",");
  const out = new Set<number>();
  for (const p of parts) {
    const stepMatch = p.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/);
    if (stepMatch) {
      const base = stepMatch[1];
      const step = parseInt(stepMatch[2], 10);
      let from = min, to = max;
      if (base !== "*") {
        const [a, b] = base.split("-").map((x) => parseInt(x, 10));
        from = a; to = isNaN(b) ? max : b;
      }
      for (let i = from; i <= to; i += step) out.add(i);
      continue;
    }
    const range = p.match(/^(\d+)-(\d+)$/);
    if (range) {
      const a = parseInt(range[1], 10), b = parseInt(range[2], 10);
      for (let i = a; i <= b; i++) out.add(i);
      continue;
    }
    if (/^\d+$/.test(p)) { out.add(parseInt(p, 10)); continue; }
    return null;
  }
  return Array.from(out).sort((a, b) => a - b);
}

function describeMinute(f: string) {
  if (f === "*") return "every minute";
  const nums = expandField(f, 0, 59);
  if (!nums) return null;
  if (nums === "*") return "every minute";
  if (nums.length === 1) return `at minute ${nums[0]}`;
  return `at minutes ${nums.join(", ")}`;
}
function describeHour(f: string) {
  if (f === "*") return "of every hour";
  const nums = expandField(f, 0, 23);
  if (!nums) return null;
  if (nums === "*") return "of every hour";
  if (nums.length === 1) return `past hour ${nums[0]}`;
  return `past hours ${nums.join(", ")}`;
}
function describeDom(f: string) {
  if (f === "*") return "every day of the month";
  const nums = expandField(f, 1, 31);
  if (!nums || nums === "*") return f === "*" ? "every day of the month" : null;
  return `on day ${nums.join(", ")} of the month`;
}
function describeMonth(f: string) {
  if (f === "*") return "every month";
  const nums = expandField(f, 1, 12);
  if (!nums || nums === "*") return null;
  return `in ${nums.map((n) => MONTH_NAMES[n - 1]).join(", ")}`;
}
function describeDow(f: string) {
  if (f === "*") return "every day of the week";
  const nums = expandField(f, 0, 6);
  if (!nums || nums === "*") return null;
  return `on ${nums.map((n) => DOW_NAMES[n % 7]).join(", ")}`;
}

export function CronParserTool() {
  const tool = tools.find((t) => t.slug === "cron-parser")!;
  const [expr, setExpr] = useState("0 9 * * 1-5");

  const parsed = useMemo(() => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return { valid: false as const, message: "A cron expression has exactly 5 fields separated by spaces." };
    const fields = parts.map((f, i) => ({ name: FIELD_NAMES[i], value: f, expanded: expandField(f, RANGES[i][0], RANGES[i][1]) }));
    const invalid = fields.find((f) => f.expanded === null);
    if (invalid) return { valid: false as const, message: `Couldn't parse ${invalid.name.toLowerCase()} field "${invalid.value}".` };
    const humanParts = [
      describeMinute(fields[0].value),
      describeHour(fields[1].value),
      describeDom(fields[2].value),
      describeMonth(fields[3].value),
      describeDow(fields[4].value),
    ].filter(Boolean);
    return { valid: true as const, human: humanParts.join(", "), fields };
  }, [expr]);

  return (
    <ToolShell
      tool={tool}
      howItWorks={[
        "Paste a standard 5-field cron expression (minute hour day-of-month month day-of-week).",
        "The tool explains each field in plain English and validates syntax.",
        "All parsing happens in your browser — no expressions leave your device.",
      ]}
    >
      <input value={expr} onChange={(e) => setExpr(e.target.value)} className="block w-full rounded-md border border-line bg-white p-3 font-mono text-sm" placeholder="0 9 * * 1-5" />

      <div className="grid gap-2 sm:grid-cols-5">
        {expr.trim().split(/\s+/).slice(0, 5).map((f, i) => (
          <div key={i} className="rounded-md border border-line bg-white p-2 text-center">
            <p className="font-mono text-[9px] uppercase tracking-widest text-graphite/60">{FIELD_NAMES[i]}</p>
            <p className="mt-1 font-mono text-sm font-bold text-ink">{f}</p>
          </div>
        ))}
      </div>

      {parsed.valid ? (
        <div className="rounded-xl border border-signal/40 bg-signal/5 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Human-readable</p>
          <p className="mt-2 text-lg text-ink first-letter:uppercase">{parsed.human}.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-800">{parsed.message}</div>
      )}

      <div className="rounded-xl border border-line bg-paper-2/60 p-4 text-sm text-graphite/80">
        <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Examples</p>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          {["*/5 * * * *", "0 9 * * 1-5", "0 0 1 * *", "30 8 * * 0"].map((e) => (
            <li key={e}><button onClick={() => setExpr(e)} className="text-signal hover:underline">{e}</button></li>
          ))}
        </ul>
      </div>
    </ToolShell>
  );
}
