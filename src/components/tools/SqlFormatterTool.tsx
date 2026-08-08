import { useMemo, useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

const SAMPLE = `select id, name, email from users where active = 1 and created_at > '2025-01-01' order by name limit 100;`;

const KEYWORDS = [
  "SELECT","FROM","WHERE","AND","OR","INNER JOIN","LEFT JOIN","RIGHT JOIN","JOIN","ON",
  "GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","INSERT INTO","VALUES","UPDATE","SET",
  "DELETE FROM","CREATE TABLE","ALTER TABLE","DROP TABLE","UNION","UNION ALL","AS","IN","NOT","IS NULL","IS NOT NULL",
];
const BREAK_BEFORE = new Set([
  "FROM","WHERE","AND","OR","INNER JOIN","LEFT JOIN","RIGHT JOIN","JOIN","ON",
  "GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","VALUES","SET","UNION","UNION ALL",
]);

function format(sql: string): string {
  let s = sql.replace(/\s+/g, " ").trim();
  // Uppercase keywords (word-boundary, case-insensitive)
  KEYWORDS.sort((a, b) => b.length - a.length).forEach((kw) => {
    const re = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
    s = s.replace(re, kw);
  });
  // Line breaks before major clauses
  BREAK_BEFORE.forEach((kw) => {
    const re = new RegExp(`\\s+${kw}\\b`, "g");
    s = s.replace(re, `\n${kw}`);
  });
  // Indent continuation lines except first
  const lines = s.split("\n");
  const first = lines[0];
  const rest = lines.slice(1).map((l) => "  " + l);
  return [first, ...rest].join("\n").trim() + "\n";
}

export function SqlFormatterTool() {
  const tool = tools.find((t) => t.slug === "sql-formatter")!;
  const [src, setSrc] = useState(SAMPLE);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const out = useMemo(() => format(src), [src]);

  const copy = async () => {
    await navigator.clipboard.writeText(out);
    setStatus({ kind: "success", message: "Copied SQL." });
  };
  const download = () => downloadBlob(new Blob([out], { type: "text/plain" }), "query.sql");

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste any SQL query on the left — SELECT, INSERT, UPDATE, DELETE, joins and unions all work.",
        "The formatter uppercases keywords and puts each clause (FROM, WHERE, JOIN, GROUP BY…) on its own line.",
        "Copy the tidy result or download it as a .sql file.",
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">SQL in</span>
          <textarea
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            rows={16}
            spellCheck={false}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Formatted</span>
          <textarea
            value={out}
            readOnly
            rows={16}
            className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-[11px] text-graphite"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={copy} disabled={!out}>Copy SQL</GhostButton>
        <GhostButton onClick={download} disabled={!out}>Download .sql</GhostButton>
      </div>
    </ToolShell>
  );
}