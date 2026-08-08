import { useMemo, useState } from "react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

export function WordCounterTool() {
  const tool = tools.find((t) => t.slug === "word-counter")!;
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g)?.length ?? 1) : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const lines = text ? text.split(/\n/).length : 0;
    const readingMin = Math.max(1, Math.ceil(words / 200));
    const speakingMin = Math.max(1, Math.ceil(words / 130));
    return { words, chars, charsNoSpaces, sentences, paragraphs, lines, readingMin, speakingMin };
  }, [text]);

  const cards: [string, string | number][] = [
    ["Words", stats.words],
    ["Characters", stats.chars],
    ["No spaces", stats.charsNoSpaces],
    ["Sentences", stats.sentences],
    ["Paragraphs", stats.paragraphs],
    ["Lines", stats.lines],
    ["Reading time", `${stats.readingMin} min`],
    ["Speaking time", `${stats.speakingMin} min`],
  ];

  return (
    <ToolShell
      tool={tool}
      howItWorks={[
        "Paste or type any text into the box below.",
        "Word, character, sentence, paragraph and reading-time counts update as you type.",
        "Everything happens locally — nothing is stored or uploaded.",
      ]}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder="Paste or type your text here…"
        className="block w-full rounded-md border border-line bg-white p-3 text-sm text-graphite focus:border-ink focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-signal">{label}</p>
            <p className="mt-1 font-mono text-2xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </ToolShell>
  );
}
