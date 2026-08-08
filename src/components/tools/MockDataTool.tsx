import { useMemo, useState } from "react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type FieldType = "id" | "uuid" | "name" | "email" | "phone" | "company" | "city" | "country" | "int" | "float" | "bool" | "date" | "word";

interface Field { name: string; type: FieldType; }

const FIRST = ["Alex","Jamie","Sam","Taylor","Jordan","Casey","Morgan","Riley","Avery","Cameron","Drew","Emerson","Finley","Harper","Reese"];
const LAST = ["Khan","Smith","Chen","Ali","Garcia","Kumar","Nguyen","Silva","Kim","Rossi","Dubois","Weber","Andersen","Novak","Farah"];
const CO = ["Acme","Umbra","Northwind","Contoso","Globex","Initech","Sirius","Wonka","Stark","Wayne"];
const CITY = ["Paris","Berlin","Cairo","Karachi","Lagos","London","Tokyo","Toronto","Madrid","Dubai"];
const COUNTRY = ["France","Germany","Egypt","Pakistan","Nigeria","United Kingdom","Japan","Canada","Spain","United Arab Emirates"];
const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore".split(" ");

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function gen(field: Field, i: number): unknown {
  switch (field.type) {
    case "id": return i + 1;
    case "uuid": return uuid();
    case "name": return `${pick(FIRST)} ${pick(LAST)}`;
    case "email": {
      const f = pick(FIRST).toLowerCase();
      const l = pick(LAST).toLowerCase();
      return `${f}.${l}@example.com`;
    }
    case "phone": return `+${1 + Math.floor(Math.random() * 99)} ${100 + Math.floor(Math.random() * 899)}-${1000 + Math.floor(Math.random() * 8999)}`;
    case "company": return `${pick(CO)} ${pick(["Corp","Ltd","Inc","GmbH","SA"])}`;
    case "city": return pick(CITY);
    case "country": return pick(COUNTRY);
    case "int": return Math.floor(Math.random() * 1000);
    case "float": return Math.round(Math.random() * 100000) / 100;
    case "bool": return Math.random() > 0.5;
    case "date": {
      const d = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 3600 * 1000));
      return d.toISOString().slice(0, 10);
    }
    case "word": return pick(WORDS);
  }
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function MockDataTool() {
  const tool = tools.find((t) => t.slug === "mock-data")!;
  const [fields, setFields] = useState<Field[]>([
    { name: "id", type: "id" },
    { name: "name", type: "name" },
    { name: "email", type: "email" },
    { name: "country", type: "country" },
    { name: "signup_at", type: "date" },
  ]);
  const [count, setCount] = useState(20);
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const [output, setOutput] = useState("");

  const preview = useMemo(() => {
    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < Math.min(5, count); i++) {
      const row: Record<string, unknown> = {};
      for (const f of fields) row[f.name] = gen(f, i);
      rows.push(row);
    }
    return format === "json" ? JSON.stringify(rows, null, 2) : toCsv(rows);
  }, [fields, format, count]);

  const generate = () => {
    try {
      const rows: Record<string, unknown>[] = [];
      for (let i = 0; i < count; i++) {
        const row: Record<string, unknown> = {};
        for (const f of fields) row[f.name] = gen(f, i);
        rows.push(row);
      }
      const out = format === "json" ? JSON.stringify(rows, null, 2) : toCsv(rows);
      setOutput(out);
      setStatus({ kind: "success", message: `Generated ${count} rows.` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  const download = () => {
    if (!output) return;
    downloadBlob(new Blob([output], { type: format === "json" ? "application/json" : "text/csv" }), `mock-data.${format}`);
  };

  const updateField = (i: number, patch: Partial<Field>) => {
    setFields((prev) => prev.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Define your columns — pick a type (name, email, uuid, int, date…) for each.",
        "Choose how many rows and whether you want JSON or CSV.",
        "Click Generate — rows appear in a preview and download in one click.",
      ]}
    >
      <div className="space-y-3">
        {fields.map((f, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              value={f.name}
              onChange={(e) => updateField(i, { name: e.target.value })}
              className="h-10 flex-1 min-w-[10rem] rounded-md border border-line bg-white px-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
              placeholder="column name"
            />
            <select
              value={f.type}
              onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
              className="h-10 rounded-md border border-line bg-white px-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
            >
              {(["id","uuid","name","email","phone","company","city","country","int","float","bool","date","word"] as FieldType[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setFields((p) => p.filter((_, k) => k !== i))}
              className="h-10 rounded-md border border-line bg-white px-3 font-mono text-xs uppercase tracking-wider text-graphite hover:border-signal hover:text-signal"
            >Remove</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFields((p) => [...p, { name: `field${p.length + 1}`, type: "word" }])}
          className="h-9 rounded-md border border-dashed border-line px-3 font-mono text-xs uppercase tracking-wider text-graphite hover:border-ink hover:text-ink"
        >+ Add column</button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Rows</span>
          <input
            type="number"
            min={1} max={10000}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
            className="mt-1 block h-10 w-28 rounded-md border border-line bg-white px-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "json" | "csv")}
            className="mt-1 block h-10 rounded-md border border-line bg-white px-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </label>
        <PrimaryButton onClick={generate}>Generate {count} rows</PrimaryButton>
        <GhostButton onClick={download} disabled={!output}>Download .{format}</GhostButton>
      </div>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">
          {output ? "Output" : "Preview (first 5 rows)"}
        </span>
        <textarea
          value={output || preview}
          readOnly
          rows={14}
          className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-[11px] text-graphite"
        />
      </label>
    </ToolShell>
  );
}