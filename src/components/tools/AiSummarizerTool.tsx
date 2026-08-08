import { useState } from "react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { loadPipeline } from "@/lib/hf-transformers";

export function AiSummarizerTool() {
  const tool = tools.find((t) => t.slug === "ai-summarizer")!;
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const run = async () => {
    if (!text.trim()) return setStatus({ kind: "error", message: "Paste some text to summarize." });
    setSummary("");
    try {
      setStatus({ kind: "working", message: "Loading model…", progress: 5 });
      const pipe = await loadPipeline<(input: string, opts?: Record<string, unknown>) => Promise<Array<{ summary_text: string }>>>(
        "summarization",
        "Xenova/distilbart-cnn-6-6",
        (m, p) => setStatus({ kind: "working", message: m, progress: p }),
      );
      setStatus({ kind: "working", message: "Summarizing…", progress: 90 });
      // Clip to first ~3000 chars to keep it snappy; model max input is 1024 tokens.
      const input = text.slice(0, 4000);
      const out = await pipe(input, { max_new_tokens: 160, min_new_tokens: 40 });
      const result = out?.[0]?.summary_text?.trim() ?? "";
      setSummary(result);
      setStatus({ kind: "success", message: `Summarized ${input.length.toLocaleString()} characters.` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste any article, email or transcript up to a few thousand words.",
        "The first run downloads the open-source DistilBART-CNN model (~150 MB) — cached forever after that.",
        "The summary is generated locally on your device and never leaves your browser.",
      ]}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Paste the text you want to summarize…"
        className="w-full rounded-lg border border-line bg-white p-4 font-mono text-sm text-ink placeholder:text-graphite/50 focus:border-ink focus:outline-none"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">
          {text.length.toLocaleString()} characters
        </span>
        <div className="flex gap-3">
          <PrimaryButton onClick={run} disabled={status.kind === "working"} loading={status.kind === "working"}>
            Summarize
          </PrimaryButton>
          <GhostButton onClick={() => { setText(""); setSummary(""); setStatus({ kind: "idle" }); }}>Clear</GhostButton>
        </div>
      </div>
      {summary && (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Summary</p>
          <div className="mt-2 whitespace-pre-wrap rounded-lg border border-line bg-paper-2 p-4 text-sm leading-relaxed text-ink">{summary}</div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(summary)}
            className="mt-3 font-mono text-[11px] uppercase tracking-widest text-signal hover:underline"
          >
            Copy summary
          </button>
        </div>
      )}
    </ToolShell>
  );
}