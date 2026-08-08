import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

type Unit = { key: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number };
type Cat = { key: string; label: string; units: Unit[] };

const lin = (f: number): Unit["toBase"] => (v) => v * f;
const linInv = (f: number): Unit["fromBase"] => (v) => v / f;
const u = (key: string, label: string, f: number): Unit => ({ key, label, toBase: lin(f), fromBase: linInv(f) });

const CATS: Cat[] = [
  { key: "length", label: "Length", units: [
    u("mm", "Millimeter (mm)", 0.001), u("cm", "Centimeter (cm)", 0.01), u("m", "Meter (m)", 1), u("km", "Kilometer (km)", 1000),
    u("in", "Inch (in)", 0.0254), u("ft", "Foot (ft)", 0.3048), u("yd", "Yard (yd)", 0.9144), u("mi", "Mile (mi)", 1609.344),
  ]},
  { key: "weight", label: "Weight", units: [
    u("mg", "Milligram (mg)", 0.001), u("g", "Gram (g)", 1), u("kg", "Kilogram (kg)", 1000), u("t", "Tonne (t)", 1_000_000),
    u("oz", "Ounce (oz)", 28.3495), u("lb", "Pound (lb)", 453.592), u("st", "Stone (st)", 6350.29),
  ]},
  { key: "temp", label: "Temperature", units: [
    { key: "c", label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
    { key: "f", label: "Fahrenheit (°F)", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    { key: "k", label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ]},
  { key: "vol", label: "Volume", units: [
    u("ml", "Milliliter (ml)", 0.001), u("l", "Liter (l)", 1), u("m3", "Cubic meter (m³)", 1000),
    u("tsp", "Teaspoon (US)", 0.00492892), u("tbsp", "Tablespoon (US)", 0.0147868), u("cup", "Cup (US)", 0.24),
    u("floz", "Fluid ounce (US)", 0.0295735), u("pt", "Pint (US)", 0.473176), u("qt", "Quart (US)", 0.946353), u("gal", "Gallon (US)", 3.78541),
    u("galuk", "Gallon (UK)", 4.54609),
  ]},
  { key: "area", label: "Area", units: [
    u("cm2", "Square centimeter (cm²)", 0.0001), u("m2", "Square meter (m²)", 1), u("ha", "Hectare (ha)", 10_000), u("km2", "Square kilometer (km²)", 1_000_000),
    u("in2", "Square inch (in²)", 0.00064516), u("ft2", "Square foot (ft²)", 0.092903), u("yd2", "Square yard (yd²)", 0.836127), u("acre", "Acre", 4046.86), u("marla", "Marla (Pakistan)", 25.2929), u("kanal", "Kanal (Pakistan)", 505.857),
  ]},
  { key: "speed", label: "Speed", units: [
    u("mps", "Meter/sec (m/s)", 1), u("kph", "Kilometer/hour (km/h)", 0.277778), u("mph", "Mile/hour (mph)", 0.44704), u("knot", "Knot", 0.514444),
  ]},
];

export function UnitConverterTool() {
  const tool = tools.find((t) => t.slug === "unit-converter")!;
  const [catKey, setCatKey] = useState("length");
  const cat = CATS.find((c) => c.key === catKey)!;
  const [from, setFrom] = useState(cat.units[0].key);
  const [to, setTo] = useState(cat.units[1].key);
  const [value, setValue] = useState("1");

  const uFrom = cat.units.find((x) => x.key === from) ?? cat.units[0];
  const uTo = cat.units.find((x) => x.key === to) ?? cat.units[1];

  const out = useMemo(() => {
    const n = parseFloat(value); if (!isFinite(n)) return "";
    const base = uFrom.toBase(n);
    return uTo.fromBase(base).toLocaleString(undefined, { maximumFractionDigits: 8 });
  }, [value, uFrom, uTo]);

  const changeCat = (k: string) => {
    setCatKey(k);
    const c = CATS.find((x) => x.key === k)!;
    setFrom(c.units[0].key);
    setTo(c.units[1]?.key ?? c.units[0].key);
  };

  return (
    <ToolShell tool={tool} howItWorks={[
      "Pick a category — length, weight, temperature, volume, area or speed.",
      "Choose your source and target units and type a value.",
      "The converted value appears instantly. Everything runs in your browser.",
    ]}>
      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c.key} type="button" onClick={() => changeCat(c.key)} className={"rounded-full border px-4 py-1 font-mono text-[11px] uppercase tracking-wider " + (catKey === c.key ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>{c.label}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-line bg-white p-4">
          <label className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">From</label>
          <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" className="mt-2 w-full rounded border border-line bg-paper-2 p-3 font-mono text-lg" />
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-2 w-full rounded border border-line bg-white p-2 font-mono text-sm">
            {cat.units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => { const t = from; setFrom(to); setTo(t); }} className="mx-auto self-center rounded-full border border-line bg-white p-2 hover:border-ink" aria-label="Swap units">
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <div className="rounded-xl border border-line bg-white p-4">
          <label className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">To</label>
          <input readOnly value={out} className="mt-2 w-full rounded border border-line bg-paper-2 p-3 font-mono text-lg" />
          <select value={to} onChange={(e) => setTo(e.target.value)} className="mt-2 w-full rounded border border-line bg-white p-2 font-mono text-sm">
            {cat.units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>
    </ToolShell>
  );
}