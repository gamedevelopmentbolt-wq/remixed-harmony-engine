import { useState } from "react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return Number(n.toFixed(4)).toString();
}

export function PercentageCalculatorTool() {
  const tool = tools.find((t) => t.slug === "percentage-calculator")!;

  const [p1, setP1] = useState("15");
  const [n1, setN1] = useState("240");

  const [p2Part, setP2Part] = useState("36");
  const [p2Whole, setP2Whole] = useState("240");

  const [p3Old, setP3Old] = useState("120");
  const [p3New, setP3New] = useState("150");

  const [tipBill, setTipBill] = useState("58");
  const [tipPct, setTipPct] = useState("15");
  const [tipPeople, setTipPeople] = useState("2");

  const r1 = (parseFloat(p1) / 100) * parseFloat(n1);
  const r2 = (parseFloat(p2Part) / parseFloat(p2Whole)) * 100;
  const r3 = ((parseFloat(p3New) - parseFloat(p3Old)) / parseFloat(p3Old)) * 100;
  const tip = parseFloat(tipBill) * (parseFloat(tipPct) / 100);
  const total = parseFloat(tipBill) + tip;
  const perPerson = total / Math.max(1, parseFloat(tipPeople));

  return (
    <ToolShell
      tool={tool}
      howItWorks={[
        "Four calculators cover 95% of everyday percentage math: X% of Y, X is what % of Y, percentage change, and tip splitting.",
        "Results update live as you type — no submit button.",
        "Runs entirely in your browser, no data sent anywhere.",
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="What is X% of Y?" result={`${p1}% of ${n1} = ${fmt(r1)}`}>
          <Row a={<InputPct v={p1} on={setP1} />} b="of" c={<Input v={n1} on={setN1} />} />
        </Card>

        <Card title="X is what % of Y?" result={`${p2Part} is ${fmt(r2)}% of ${p2Whole}`}>
          <Row a={<Input v={p2Part} on={setP2Part} />} b="is what % of" c={<Input v={p2Whole} on={setP2Whole} />} />
        </Card>

        <Card title="Percentage change" result={`${p3Old} → ${p3New} = ${fmt(r3)}%`}>
          <Row a={<Input v={p3Old} on={setP3Old} />} b="→" c={<Input v={p3New} on={setP3New} />} />
        </Card>

        <Card title="Tip & split" result={`Tip ${fmt(tip)} · Total ${fmt(total)} · Each ${fmt(perPerson)}`}>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs"><span className="mb-1 block font-mono text-[10px] uppercase text-graphite/60">Bill</span><Input v={tipBill} on={setTipBill} /></label>
            <label className="text-xs"><span className="mb-1 block font-mono text-[10px] uppercase text-graphite/60">Tip %</span><Input v={tipPct} on={setTipPct} /></label>
            <label className="text-xs"><span className="mb-1 block font-mono text-[10px] uppercase text-graphite/60">People</span><Input v={tipPeople} on={setTipPeople} /></label>
          </div>
        </Card>
      </div>
    </ToolShell>
  );
}

function Card({ title, result, children }: { title: string; result: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">{title}</p>
      <div className="mt-3">{children}</div>
      <p className="mt-3 rounded-md border border-signal/40 bg-signal/5 p-2 font-mono text-sm text-ink">{result}</p>
    </div>
  );
}
function Row({ a, b, c }: { a: React.ReactNode; b: string; c: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">{a}</div>
      <span className="font-mono text-xs text-graphite/60">{b}</span>
      <div className="flex-1">{c}</div>
    </div>
  );
}
function Input({ v, on }: { v: string; on: (s: string) => void }) {
  return <input value={v} onChange={(e) => on(e.target.value)} inputMode="decimal" className="w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />;
}
function InputPct({ v, on }: { v: string; on: (s: string) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-line bg-white pr-2">
      <input value={v} onChange={(e) => on(e.target.value)} inputMode="decimal" className="w-full border-none bg-transparent p-2 font-mono text-sm outline-none" />
      <span className="font-mono text-xs text-graphite/60">%</span>
    </div>
  );
}
