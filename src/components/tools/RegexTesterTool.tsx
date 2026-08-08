import { useMemo, useState } from "react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

const FLAGS = ["g", "i", "m", "s", "u", "y"] as const;
type Flag = (typeof FLAGS)[number];

export function RegexTesterTool() {
  const tool = tools.find((t) => t.slug === "regex-tester")!;
  const [pattern, setPattern] = useState("(\\w+)@(\\w+\\.\\w+)");
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g", "i"]));
  const [text, setText] = useState("Contact Alice at alice@example.com or Bob at bob@site.co.");
  const [replace, setReplace] = useState("$1 [at] $2");

  const flagStr = Array.from(flags).join("");

  const { error, matches, highlighted, replaced } = useMemo(() => {
    try {
      const re = new RegExp(pattern, flagStr || undefined);
      const matches: RegExpMatchArray[] = [];
      if (flags.has("g")) {
        const it = text.matchAll(re);
        for (const m of it) matches.push(m);
      } else {
        const m = text.match(re);
        if (m) matches.push(m);
      }
      // Highlight
      const re2 = new RegExp(pattern, (flagStr.includes("g") ? flagStr : flagStr + "g") || undefined);
      const parts: { text: string; hit: boolean }[] = [];
      let last = 0;
      for (const m of text.matchAll(re2)) {
        const idx = m.index ?? 0;
        if (idx > last) parts.push({ text: text.slice(last, idx), hit: false });
        parts.push({ text: m[0], hit: true });
        last = idx + m[0].length;
        if (m[0].length === 0) last++; // avoid infinite
      }
      if (last < text.length) parts.push({ text: text.slice(last), hit: false });

      const replaced = text.replace(re, replace);
      return { error: "", matches, highlighted: parts, replaced };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e), matches: [], highlighted: [{ text, hit: false }], replaced: "" };
    }
  }, [pattern, flagStr, text, replace, flags]);

  const toggle = (f: Flag) => {
    setFlags((cur) => {
      const n = new Set(cur);
      if (n.has(f)) n.delete(f); else n.add(f);
      return n;
    });
  };

  return (
    <ToolShell
      tool={tool}
      howItWorks={[
        "Write a JavaScript regular expression pattern and toggle the flags you want.",
        "Matches highlight live in the sample text; capture groups appear in the match list.",
        "Optionally provide a replacement string (supports $1, $2 backreferences).",
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Pattern</span>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-line bg-white p-2 font-mono text-sm focus-within:border-ink">
            <span className="text-graphite/60">/</span>
            <input value={pattern} onChange={(e) => setPattern(e.target.value)}
              className="min-w-0 flex-1 bg-transparent focus:outline-none" spellCheck={false} />
            <span className="text-graphite/60">/{flagStr}</span>
          </div>
        </label>
        <div className="flex items-end gap-1">
          {FLAGS.map((f) => (
            <button key={f} type="button" onClick={() => toggle(f)}
              className={"h-9 w-9 rounded-md border font-mono text-sm " + (flags.has(f) ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 font-mono text-xs text-destructive">
          {error}
        </p>
      )}

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Test string</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} spellCheck={false}
          className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none" />
      </label>

      <div className="rounded-xl border border-line bg-white p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Highlighted</p>
        <p className="mt-2 whitespace-pre-wrap break-words font-mono text-xs text-ink">
          {highlighted.map((p, i) =>
            p.hit ? <mark key={i} className="rounded bg-signal/30 px-0.5">{p.text}</mark> : <span key={i}>{p.text}</span>
          )}
        </p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-graphite">
          {matches.length} match{matches.length === 1 ? "" : "es"}
        </p>
        {matches.length > 0 && (
          <ol className="mt-2 space-y-1">
            {matches.slice(0, 50).map((m, i) => (
              <li key={i} className="rounded-md bg-paper-2 p-2 font-mono text-[11px] text-ink">
                <span className="text-signal">#{i + 1}</span> <code>{m[0]}</code>
                {m.length > 1 && (
                  <span className="ml-2 text-graphite/70">
                    groups: {m.slice(1).map((g, gi) => `$${gi + 1}=${JSON.stringify(g)}`).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Replacement (optional)</span>
        <input value={replace} onChange={(e) => setReplace(e.target.value)} spellCheck={false}
          className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm focus:border-ink focus:outline-none" />
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Replaced output</span>
        <textarea value={replaced} readOnly rows={4}
          className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-xs text-graphite" />
      </label>
    </ToolShell>
  );
}
