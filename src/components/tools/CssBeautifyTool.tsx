import { useMemo, useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

const SAMPLE = `body{margin:0;font-family:system-ui}a{color:#0af;text-decoration:none}a:hover{text-decoration:underline}.card{padding:1rem;border:1px solid #eee}`;

function beautify(src: string, indent = "  "): string {
  // Tokenize simply: split on { } ;
  let out = "";
  let depth = 0;
  let buf = "";
  const flush = (end = "") => {
    const line = buf.trim();
    if (line) out += indent.repeat(depth) + line + end + "\n";
    buf = "";
  };
  for (const ch of src) {
    if (ch === "{") {
      const sel = buf.trim();
      buf = "";
      if (sel) out += indent.repeat(depth) + sel + " {\n";
      depth++;
    } else if (ch === "}") {
      flush(";");
      depth = Math.max(0, depth - 1);
      out += indent.repeat(depth) + "}\n";
    } else if (ch === ";") {
      flush(";");
    } else {
      buf += ch;
    }
  }
  const tail = buf.trim();
  if (tail) out += indent.repeat(depth) + tail + "\n";
  return out.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function CssBeautifyTool() {
  const tool = tools.find((t) => t.slug === "css-beautify")!;
  const [src, setSrc] = useState(SAMPLE);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const out = useMemo(() => beautify(src), [src]);

  const copy = async () => {
    await navigator.clipboard.writeText(out);
    setStatus({ kind: "success", message: "Copied CSS." });
  };
  const download = () => downloadBlob(new Blob([out], { type: "text/css" }), "styles.css");

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Paste minified or messy CSS on the left.",
        "The beautifier indents declarations, one per line, with proper nesting for media queries and selectors.",
        "Copy the tidy output or download it as .css.",
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">CSS in</span>
          <textarea
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            rows={16}
            spellCheck={false}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Beautified</span>
          <textarea
            value={out}
            readOnly
            rows={16}
            className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-[11px] text-graphite"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={copy} disabled={!out}>Copy CSS</GhostButton>
        <GhostButton onClick={download} disabled={!out}>Download .css</GhostButton>
      </div>
    </ToolShell>
  );
}