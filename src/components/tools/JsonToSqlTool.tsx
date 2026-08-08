import { useMemo, useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

const SAMPLE = `[
  { "id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "active": true, "score": 98.5 },
  { "id": 2, "name": "Alan Turing", "email": "alan@example.com", "active": true, "score": 99.9 },
  { "id": 3, "name": "Grace Hopper", "email": "grace@example.com", "active": false, "score": 97.1 }
]`;

function inferType(vals: unknown[]): string {
  const nonNull = vals.filter((v) => v !== null && v !== undefined);
  if (nonNull.length === 0) return "TEXT";
  if (nonNull.every((v) => typeof v === "boolean")) return "BOOLEAN";
  if (nonNull.every((v) => typeof v === "number" && Number.isInteger(v))) return "INTEGER";
  if (nonNull.every((v) => typeof v === "number")) return "REAL";
  if (nonNull.every((v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v as string))) return "DATE";
  return "TEXT";
}

function sqlLit(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function convert(src: string, table: string): { sql: string; error?: string } {
  try {
    const parsed = JSON.parse(src);
    const rows: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0) return { sql: "" };
    const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    const types: Record<string, string> = {};
    for (const c of cols) types[c] = inferType(rows.map((r) => r[c]));
    const create = `CREATE TABLE ${table} (\n  ${cols.map((c) => `${c} ${types[c]}`).join(",\n  ")}\n);`;
    const inserts = rows
      .map((r) => `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map((c) => sqlLit(r[c])).join(", ")});`)
      .join("\n");
    return { sql: `${create}\n\n${inserts}\n` };
  } catch (err) {
    return { sql: "", error: err instanceof Error ? err.message : "Invalid JSON" };
  }
}

export function JsonToSqlTool() {
  const tool = tools.find((t) => t.slug === "json-to-sql")!;
  const [src, setSrc] = useState(SAMPLE);
  const [table, setTable] = useState("my_table");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const { sql, error } = useMemo(() => convert(src, table.replace(/[^a-zA-Z0-9_]/g, "_") || "my_table"), [src, table]);

  const copy = async () => {
    await navigator.clipboard.writeText(sql);
    setStatus({ kind: "success", message: "Copied SQL." });
  };
  const download = () => downloadBlob(new Blob([sql], { type: "text/plain" }), `${table || "table"}.sql`);

  return (
    <ToolShell
      tool={tool}
      status={error ? { kind: "error", message: error } : status}
      howItWorks={[
        "Paste a JSON array (or single object) on the left. Types are auto-detected per column.",
        "Set the target table name — the tool emits CREATE TABLE + INSERT statements.",
        "Copy or download the .sql file — SQLite / MySQL / Postgres-friendly.",
      ]}
    >
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Table name</span>
        <input
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="mt-1 block h-10 w-full max-w-xs rounded-md border border-line bg-white px-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
        />
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">JSON in</span>
          <textarea
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            rows={16}
            spellCheck={false}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">SQL out</span>
          <textarea
            value={sql}
            readOnly
            rows={16}
            className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-[11px] text-graphite"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={copy} disabled={!sql}>Copy SQL</GhostButton>
        <GhostButton onClick={download} disabled={!sql}>Download .sql</GhostButton>
      </div>
    </ToolShell>
  );
}