import { useMemo, useState } from "react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

const WORDS = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum").split(" ");

type Unit = "paragraphs" | "sentences" | "words";

function rand(n: number) { return Math.floor(Math.random() * n); }
function pickWord() { return WORDS[rand(WORDS.length)]; }
function sentence() {
  const len = 6 + rand(12);
  const w = Array.from({ length: len }, pickWord);
  w[0] = w[0][0].toUpperCase() + w[0].slice(1);
  return w.join(" ") + ".";
}
function paragraph() {
  const s = 3 + rand(4);
  return Array.from({ length: s }, sentence).join(" ");
}
function words(n: number) {
  return Array.from({ length: n }, pickWord).join(" ");
}

export function LoremIpsumTool() {
  const tool = tools.find((t) => t.slug === "lorem-ipsum")!;
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [startClassic, setStartClassic] = useState(true);
  const [seed, setSeed] = useState(0);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const output = useMemo(() => {
    void seed;
    if (unit === "words") return words(count);
    if (unit === "sentences") return Array.from({ length: count }, sentence).join(" ");
    const parts = Array.from({ length: count }, paragraph);
    if (startClassic && parts.length > 0) {
      parts[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + parts[0];
    }
    return parts.join("\n\n");
  }, [count, unit, startClassic, seed]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setStatus({ kind: "success", message: "Copied." });
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Choose whether you want paragraphs, sentences, or words and how many.",
        "Click Generate for fresh placeholder text — locally, no request to any server.",
        "Copy the output for mockups, wireframes or design work.",
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Count</span>
          <input
            type="number" min={1} max={200} value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value))))}
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Unit</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm focus:border-ink focus:outline-none"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </label>
        {unit === "paragraphs" && (
          <label className="flex items-end gap-2 pb-2">
            <input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} />
            <span className="font-mono text-xs">Start with "Lorem ipsum…"</span>
          </label>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={() => setSeed((s) => s + 1)}>Generate</PrimaryButton>
        <GhostButton onClick={copy}>Copy</GhostButton>
      </div>
      <textarea
        value={output}
        readOnly rows={12}
        className="block w-full rounded-md border border-line bg-paper-2/50 p-3 text-sm text-graphite"
      />
    </ToolShell>
  );
}
