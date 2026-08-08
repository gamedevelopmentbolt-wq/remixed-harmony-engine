import { useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

type Case =
  | "upper" | "lower" | "title" | "sentence"
  | "camel" | "pascal" | "snake" | "kebab" | "constant" | "invert";

const toTitle = (s: string) =>
  s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
const toSentence = (s: string) =>
  s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
const words = (s: string) =>
  s.replace(/([a-z])([A-Z])/g, "$1 $2").split(/[^a-zA-Z0-9]+/).filter(Boolean);

const transforms: Record<Case, (s: string) => string> = {
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
  title: toTitle,
  sentence: toSentence,
  camel: (s) => {
    const w = words(s).map((x) => x.toLowerCase());
    return w.map((x, i) => (i === 0 ? x : x[0].toUpperCase() + x.slice(1))).join("");
  },
  pascal: (s) => words(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(""),
  snake: (s) => words(s).map((x) => x.toLowerCase()).join("_"),
  kebab: (s) => words(s).map((x) => x.toLowerCase()).join("-"),
  constant: (s) => words(s).map((x) => x.toUpperCase()).join("_"),
  invert: (s) => s.split("").map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(""),
};

const labels: Record<Case, string> = {
  upper: "UPPERCASE", lower: "lowercase", title: "Title Case", sentence: "Sentence case",
  camel: "camelCase", pascal: "PascalCase", snake: "snake_case", kebab: "kebab-case",
  constant: "CONSTANT_CASE", invert: "iNVERT cASE",
};

export function CaseConverterTool() {
  const tool = tools.find((t) => t.slug === "case-converter")!;
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Case>("title");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const output = input ? transforms[mode](input) : "";

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setStatus({ kind: "success", message: "Copied." });
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste your text into the input box.",
        "Pick a case style — UPPER, lower, Title, Sentence, camelCase, snake_case and more.",
        "Copy the result. Nothing leaves your browser.",
      ]}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        placeholder="Type or paste text…"
        className="block w-full rounded-md border border-line bg-white p-3 text-sm text-graphite focus:border-ink focus:outline-none"
      />
      <div className="flex flex-wrap gap-2">
        {(Object.keys(transforms) as Case[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            className={
              "rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition " +
              (mode === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink")
            }
          >
            {labels[k]}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Result — {labels[mode]}</span>
        <textarea
          value={output}
          readOnly
          rows={6}
          placeholder="Result appears here"
          className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 text-sm text-graphite"
        />
      </label>
      <div>
        <GhostButton onClick={copy} disabled={!output}>Copy result</GhostButton>
      </div>
    </ToolShell>
  );
}
