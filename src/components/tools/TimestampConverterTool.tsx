import { useEffect, useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

function toIsoLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function TimestampConverterTool() {
  const tool = tools.find((t) => t.slug === "timestamp-converter")!;
  // Time-dependent values must not be computed during SSR/first render,
  // otherwise the server markup never matches the client (hydration mismatch).
  const [now, setNow] = useState(0);
  const [ts, setTs] = useState<string>("");
  const [iso, setIso] = useState<string>("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  useEffect(() => {
    const n = Date.now();
    setNow(n);
    setTs(Math.floor(n / 1000).toString());
    setIso(new Date(n).toISOString());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parseTs = (raw: string) => {
    if (!raw.trim()) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    // If < 10^12, treat as seconds
    const ms = raw.trim().length <= 10 ? n * 1000 : n;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  };

  const onTsChange = (v: string) => {
    setTs(v);
    if (!v.trim()) { setIso(""); setStatus({ kind: "idle" }); return; }
    const d = parseTs(v);
    if (d) { setIso(d.toISOString()); setStatus({ kind: "idle" }); }
    else setStatus({ kind: "error", message: "Not a valid timestamp." });
  };
  const onIsoChange = (v: string) => {
    setIso(v);
    const d = new Date(v);
    if (!isNaN(d.getTime())) { setTs(Math.floor(d.getTime() / 1000).toString()); setStatus({ kind: "idle" }); }
    else setStatus({ kind: "error", message: "Not a valid date." });
  };

  const d = parseTs(ts);
  const useNow = () => {
    const n = Math.floor(Date.now() / 1000);
    setTs(n.toString());
    setIso(new Date(n * 1000).toISOString());
  };
  const copy = async (v: string) => {
    await navigator.clipboard.writeText(v);
    setStatus({ kind: "success", message: "Copied." });
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Type a Unix timestamp (seconds or milliseconds) or an ISO date — both sides stay in sync.",
        "The current time updates live, so you can grab a fresh timestamp with one click.",
        "Everything is computed locally in your browser.",
      ]}
    >
      <div className="rounded-xl border border-line bg-white p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Live current time</p>
        <p className="mt-1 font-mono text-lg font-bold text-ink">{now ? Math.floor(now / 1000) : "—"}</p>
        <p className="font-mono text-xs text-graphite">{now ? new Date(now).toISOString() : "—"}</p>
        <GhostButton className="mt-3 !h-9 !text-[11px]" onClick={useNow}>Use now</GhostButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Unix timestamp (s or ms)</span>
          <input
            value={ts}
            onChange={(e) => onTsChange(e.target.value)}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm focus:border-ink focus:outline-none"
          />
          <GhostButton className="mt-2 !h-9 !text-[11px]" onClick={() => copy(ts)}>Copy</GhostButton>
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">ISO 8601 (UTC)</span>
          <input
            value={iso}
            onChange={(e) => onIsoChange(e.target.value)}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm focus:border-ink focus:outline-none"
          />
          <GhostButton className="mt-2 !h-9 !text-[11px]" onClick={() => copy(iso)}>Copy</GhostButton>
        </label>
      </div>

      {d && (
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Human readable</p>
          <p className="mt-1 text-sm text-ink"><strong>UTC:</strong> {d.toUTCString()}</p>
          <p className="text-sm text-ink"><strong>Local:</strong> {d.toString()}</p>
          <p className="text-sm text-ink"><strong>Local ISO:</strong> {toIsoLocal(d)}</p>
          <p className="text-sm text-ink"><strong>Milliseconds:</strong> {d.getTime()}</p>
        </div>
      )}
    </ToolShell>
  );
}
