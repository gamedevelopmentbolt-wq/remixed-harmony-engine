import { useMemo, useState } from "react";
import { ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

export function BmiCalculatorTool() {
  const tool = tools.find((t) => t.slug === "bmi-calculator")!;
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [height, setHeight] = useState(170); // cm or inches
  const [weight, setWeight] = useState(65); // kg or lb

  const bmi = useMemo(() => {
    if (units === "metric") {
      const m = height / 100;
      return m > 0 ? weight / (m * m) : 0;
    }
    return height > 0 ? (weight / (height * height)) * 703 : 0;
  }, [units, height, weight]);

  const cat = bmi === 0 ? "" :
    bmi < 18.5 ? "Underweight" :
    bmi < 25 ? "Normal weight" :
    bmi < 30 ? "Overweight" :
    bmi < 35 ? "Obesity class I" :
    bmi < 40 ? "Obesity class II" : "Obesity class III";
  const color = bmi === 0 ? "text-graphite" :
    bmi < 18.5 || bmi >= 30 ? "text-destructive" :
    bmi < 25 ? "text-workshop" : "text-signal";

  return (
    <ToolShell tool={tool} status={{ kind: "idle" } as ToolStatus}
      howItWorks={[
        "Choose metric (cm / kg) or imperial (in / lb) units.",
        "Enter your height and weight.",
        "Your BMI is calculated instantly with the WHO category label.",
      ]}>
      <div className="flex gap-2">
        {(["metric", "imperial"] as const).map((u) => (
          <button key={u} type="button" onClick={() => setUnits(u)}
            aria-pressed={units === u}
            className={"inline-flex h-8 items-center rounded-full border px-3 font-mono text-[11px] uppercase tracking-wider " +
              (units === u ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}>
            {u === "metric" ? "Metric (cm / kg)" : "Imperial (in / lb)"}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className="font-mono text-xs uppercase tracking-wider">Height ({units === "metric" ? "cm" : "in"})</span>
          <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
        <label><span className="font-mono text-xs uppercase tracking-wider">Weight ({units === "metric" ? "kg" : "lb"})</span>
          <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm" />
        </label>
      </div>
      <div className="rounded-xl border border-line bg-white p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-graphite/60">Your BMI</p>
        <p className={"mt-2 font-mono text-5xl font-bold " + color}>{bmi.toFixed(1)}</p>
        <p className={"mt-2 font-mono text-sm uppercase tracking-wider " + color}>{cat}</p>
      </div>
      <p className="font-mono text-[11px] text-graphite/60">
        BMI is a rough guide, not a diagnosis. It doesn't account for muscle mass, age, ethnicity or body composition. Consult a clinician for personal medical advice.
      </p>
    </ToolShell>
  );
}
