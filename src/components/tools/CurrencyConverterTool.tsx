import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

const SUPPORTED = ["PKR", "USD", "EUR", "AED", "GBP"] as const;
type Cur = (typeof SUPPORTED)[number];

// Fallback snapshot (USD base) — used if the API can't be reached. Approximate.
const FALLBACK: Record<Cur, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  PKR: 278.5,
};

interface Cache {
  base: "USD";
  rates: Record<string, number>;
  updated: number;
}
const CACHE_KEY = "efm_fx_v1";
const ONE_HOUR = 60 * 60 * 1000;

async function fetchRates(): Promise<Cache> {
  const cached = typeof localStorage !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
  if (cached) {
    const parsed: Cache = JSON.parse(cached);
    if (Date.now() - parsed.updated < ONE_HOUR) return parsed;
  }
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!r.ok) throw new Error("bad status");
    const j = await r.json();
    if (j?.result !== "success") throw new Error("bad payload");
    const out: Cache = { base: "USD", rates: j.rates, updated: Date.now() };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(out)); } catch { /* quota */ }
    return out;
  } catch {
    return { base: "USD", rates: FALLBACK, updated: 0 };
  }
}

export function CurrencyConverterTool() {
  const tool = tools.find((t) => t.slug === "currency-converter")!;
  const [rates, setRates] = useState<Cache | null>(null);
  const [from, setFrom] = useState<Cur>("PKR");
  const [to, setTo] = useState<Cur>("USD");
  const [amount, setAmount] = useState("1000");
  const [status, setStatus] = useState<ToolStatus>({ kind: "working", message: "Loading latest rates…" });

  const load = async () => {
    setStatus({ kind: "working", message: "Fetching latest rates…" });
    const c = await fetchRates();
    setRates(c);
    setStatus({ kind: "idle" });
  };
  useEffect(() => { load(); }, []);

  const converted = useMemo(() => {
    if (!rates) return "";
    const n = parseFloat(amount);
    if (!isFinite(n)) return "";
    const usd = n / (rates.rates[from] ?? 1);
    const out = usd * (rates.rates[to] ?? 1);
    return out.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [rates, amount, from, to]);

  const perOne = useMemo(() => {
    if (!rates) return "";
    const usd = 1 / (rates.rates[from] ?? 1);
    const out = usd * (rates.rates[to] ?? 1);
    return out.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [rates, from, to]);

  const updatedTxt = rates?.updated ? new Date(rates.updated).toLocaleString() : "offline snapshot";

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Enter an amount and pick source & target currency.",
      "Rates are fetched once and cached for one hour, then used offline.",
      "Tap the swap arrow to invert the pair. Results update instantly.",
    ]}>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-line bg-white p-4">
          <label className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">From</label>
          <div className="mt-2 flex gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="w-full rounded border border-line bg-paper-2 p-3 font-mono text-lg text-ink focus:border-ink focus:outline-none"
            />
            <select value={from} onChange={(e) => setFrom(e.target.value as Cur)} className="rounded border border-line bg-white p-3 font-mono text-sm">
              {SUPPORTED.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { const t = from; setFrom(to); setTo(t); }}
          className="mx-auto self-center rounded-full border border-line bg-white p-2 hover:border-ink"
          aria-label="Swap currencies"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <div className="rounded-xl border border-line bg-white p-4">
          <label className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">To</label>
          <div className="mt-2 flex gap-2">
            <input readOnly value={converted} className="w-full rounded border border-line bg-paper-2 p-3 font-mono text-lg text-ink" />
            <select value={to} onChange={(e) => setTo(e.target.value as Cur)} className="rounded border border-line bg-white p-3 font-mono text-sm">
              {SUPPORTED.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-graphite">
        <p className="font-mono">1 {from} = {perOne} {to}</p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">Rates: {updatedTxt}</p>
        <PrimaryButton onClick={load}><RefreshCw className="h-4 w-4" />Refresh rates</PrimaryButton>
      </div>
      <p className="text-xs text-graphite/70">
        Rates are indicative daily mid-market values from open.er-api.com. Banks and money-changers apply their own margins, so a live wire transfer will differ slightly.
      </p>
    </ToolShell>
  );
}