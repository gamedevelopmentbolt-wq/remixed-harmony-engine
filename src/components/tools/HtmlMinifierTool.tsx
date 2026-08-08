import { useMemo, useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

const SAMPLE = `<!doctype html>
<html>
  <head>
    <title>Demo</title>
    <!-- comment -->
  </head>
  <body>
    <h1>Hello</h1>
    <p>Some   text   with   spaces.</p>
  </body>
</html>`;

function minify(src: string): string {
  return src
    // strip HTML comments (keep IE conditionals)
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    // trim inline <style> and <script> lightly
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*=\s*/g, "=")
    .trim();
}

export function HtmlMinifierTool() {
  const tool = tools.find((t) => t.slug === "html-minifier")!;
  const [src, setSrc] = useState(SAMPLE);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const out = useMemo(() => minify(src), [src]);
  const saved = Math.max(0, src.length - out.length);
  const pct = src.length ? Math.round((saved / src.length) * 100) : 0;

  const copy = async () => {
    await navigator.clipboard.writeText(out);
    setStatus({ kind: "success", message: "Copied minified HTML." });
  };
  const download = () => downloadBlob(new Blob([out], { type: "text/html" }), "minified.html");

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste your HTML source on the left.",
        "The minifier strips comments, extra whitespace and unnecessary space around attributes in real time.",
        "Copy the minified output or download it as .html — everything happens locally.",
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">HTML in</span>
          <textarea
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            rows={16}
            spellCheck={false}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Minified</span>
          <textarea
            value={out}
            readOnly
            rows={16}
            className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-[11px] text-graphite"
          />
        </label>
      </div>
      <p className="font-mono text-xs text-graphite">
        Saved <strong className="text-signal">{saved.toLocaleString()}</strong> bytes ({pct}%) — {src.length.toLocaleString()} → {out.length.toLocaleString()}
      </p>
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={copy} disabled={!out}>Copy minified</GhostButton>
        <GhostButton onClick={download} disabled={!out}>Download .html</GhostButton>
      </div>
    </ToolShell>
  );
}