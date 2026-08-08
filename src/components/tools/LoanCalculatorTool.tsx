import { useMemo, useState } from "react";
import { ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export function LoanCalculatorTool() {
  const tool = tools.find((t) => t.slug === "loan-calculator")!;
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(5);

  const { emi, total, interest, schedule } = useMemo(() => {
    const n = Math.max(1, Math.round(years * 12));
    const r = rate / 100 / 12;
    const p = principal;
    const e = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const t = e * n;
    let balance = p;
    const sched: { m: number; interest: number; principal: number; balance: number }[] = [];
    for (let i = 1; i <= n; i++) {
      const iPart = balance * r;
      const pPart = e - iPart;
      balance = Math.max(0, balance - pPart);
      if (i <= 12 || i === n) sched.push({ m: i, interest: iPart, principal: pPart, balance });
    }
    return { emi: e, total: t, interest: t - p, schedule: sched };
  }, [principal, rate, years]);

  return (
    <ToolShell tool={tool} status={{ kind: "idle" } as ToolStatus}
      howItWorks={[
        "Enter loan amount, annual interest rate and term in years.",
        "The monthly EMI is calculated from the standard amortization formula.",
        "See total interest and the first 12 months of the amortization schedule.",
      ]}>
      <div className="grid gap-3 sm:grid-cols-3">
        <label><span className="font-mono text-xs uppercase tracking-wider">Loan amount</span>
          <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label><span className="font-mono text-xs uppercase tracking-wider">Annual rate (%)</span>
          <input type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label><span className="font-mono text-xs uppercase tracking-wider">Term (years)</span>
          <input type="number" step="0.5" value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { k: "Monthly EMI", v: emi },
          { k: "Total interest", v: interest },
          { k: "Total payment", v: total },
        ].map((c) => (
          <div key={c.k} className="rounded-xl border border-line bg-white p-4 text-center">
            <p className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">{c.k}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-ink">{fmt(c.v)}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-paper-2">
            <tr>
              {["Month", "Principal", "Interest", "Balance"].map((h) => (
                <th key={h} className="p-3 uppercase tracking-widest text-graphite/70">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((r) => (
              <tr key={r.m} className="border-t border-line">
                <td className="p-3">{r.m}</td>
                <td className="p-3">{fmt(r.principal)}</td>
                <td className="p-3">{fmt(r.interest)}</td>
                <td className="p-3">{fmt(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolShell>
  );
}
