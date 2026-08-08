import { useState } from "react";
import { Copy } from "lucide-react";
import { ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

type BaseKey = "bin" | "oct" | "dec" | "hex";
const bases: Record<BaseKey, { label: string; radix: number; re: RegExp }> = {
  bin: { label: "Binary (base 2)", radix: 2, re: /^[01]+$/ },
  oct: { label: "Octal (base 8)", radix: 8, re: /^[0-7]+$/ },
  dec: { label: "Decimal (base 10)", radix: 10, re: /^\d+$/ },
  hex: { label: "Hexadecimal (base 16)", radix: 16, re: /^[0-9a-fA-F]+$/ },
};

export function NumberBaseTool() {
  const tool = tools.find((t) => t.slug === "number-base")!;
  const [from, setFrom] = useState<BaseKey>("dec");
  const [value, setValue] = useState("255");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const v = value.trim();
  const spec = bases[from];
  const valid = v.length > 0 && spec.re.test(v);
  let big: bigint | null = null;
  if (valid) {
    try {
      big = BigInt(from === "hex" ? `0x${v}` : from === "oct" ? `0o${v}` : from === "bin" ? `0b${v}` : v);
    } catch { big = null; }
  }

  const copy = async (s: string) => { await navigator.clipboard.writeText(s); setStatus({ kind: "success", message: "Copied." }); };

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Choose the base of your input number (binary, octal, decimal, hex).",
        "Enter the number — arbitrarily large values are supported via BigInt.",
        "Copy any of the four representations with one click.",
      ]}>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block sm:col-span-1">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Input base</span>
          <select value={from} onChange={(e) => setFrom(e.target.value as BaseKey)}
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm">
            {(Object.keys(bases) as BaseKey[]).map((k) => (<option key={k} value={k}>{bases[k].label}</option>))}
          </select>
        </label>
        <label className="block sm:col-span-3">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Value</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} spellCheck={false}
            className={"mt-2 block w-full rounded-md border bg-white p-2 font-mono text-sm " + (valid || !v ? "border-line" : "border-destructive")} />
        </label>
      </div>
      {!valid && v && <p className="font-mono text-xs text-destructive">Invalid characters for {spec.label}.</p>}
      {big !== null && (
        <ul className="divide-y divide-line rounded-xl border border-line bg-white">
          {(Object.keys(bases) as BaseKey[]).map((k) => {
            const s = big!.toString(bases[k].radix).toUpperCase();
            return (
              <li key={k} className="flex items-center gap-3 px-4 py-3">
                <span className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-widest text-graphite/70">{bases[k].label}</span>
                <code className="min-w-0 flex-1 break-all font-mono text-sm text-ink">{s}</code>
                <button onClick={() => copy(s)} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-3 font-mono text-[11px] uppercase tracking-wider hover:border-ink">
                  <Copy className="h-3.5 w-3.5" />Copy
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </ToolShell>
  );
}
