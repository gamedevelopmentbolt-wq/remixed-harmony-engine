import { useMemo, useState } from "react";
import TurndownService from "turndown";
import { Copy } from "lucide-react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function HtmlToMarkdownTool() {
  const tool = tools.find((t) => t.slug === "html-to-markdown")!;
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const md = useMemo(() => {
    if (!html.trim()) return "";
    try {
      const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
      return td.turndown(html);
    } catch (e) {
      return `<!-- error: ${e instanceof Error ? e.message : "conversion failed"} -->`;
    }
  }, [html]);

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Paste an HTML snippet or a full page's HTML into the input box.",
        "Turndown converts it to clean GitHub-flavored Markdown, live in your browser.",
        "Copy the Markdown or download it as a .md file.",
      ]}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">HTML input</span>
          <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={16}
            placeholder="<h1>Hello</h1><p>World</p>"
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs focus:border-ink focus:outline-none" />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Markdown output</span>
          <textarea value={md} readOnly rows={16}
            className="mt-2 block w-full rounded-md border border-line bg-paper-2 p-3 font-mono text-xs" />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={async () => { await navigator.clipboard.writeText(md); setStatus({ kind: "success", message: "Copied." }); }}>
          <Copy className="mr-2 h-4 w-4" />Copy Markdown
        </GhostButton>
        <GhostButton onClick={() => downloadBlob(new Blob([md], { type: "text/markdown" }), "content.md")}>
          Download .md
        </GhostButton>
      </div>
    </ToolShell>
  );
}
