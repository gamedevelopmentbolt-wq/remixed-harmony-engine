import { useEffect, useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

const SAMPLE = `# Hello, Markdown

A quick **example** with a [link](https://example.com) and some \`code\`.

- Item one
- Item two
- Item three

> Blockquote here.

\`\`\`js
const x = 42;
\`\`\`
`;

export function MarkdownToHtmlTool() {
  const tool = tools.find((t) => t.slug === "markdown-to-html")!;
  const [md, setMd] = useState(SAMPLE);
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { marked } = await import("marked");
        const result = await marked.parse(md, { async: true, breaks: true, gfm: true });
        if (!cancel) setHtml(String(result));
      } catch (err) {
        if (!cancel) setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
      }
    })();
    return () => { cancel = true; };
  }, [md]);

  const copy = async () => {
    await navigator.clipboard.writeText(html);
    setStatus({ kind: "success", message: "Copied HTML." });
  };
  const download = () => downloadBlob(new Blob([html], { type: "text/html" }), "document.html");

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Type or paste Markdown on the left — headings, lists, links, code, tables (GFM).",
        "The HTML preview and source update live in your browser.",
        "Copy the HTML or download it as a .html file.",
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Markdown</span>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            rows={16}
            spellCheck={false}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
          />
        </label>
        <div className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Preview</span>
          <div
            className="prose prose-sm mt-2 max-w-none rounded-md border border-line bg-white p-4 text-ink"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">HTML source</span>
        <textarea
          value={html}
          readOnly rows={8}
          className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-[11px] text-graphite"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <GhostButton onClick={copy} disabled={!html}>Copy HTML</GhostButton>
        <GhostButton onClick={download} disabled={!html}>Download .html</GhostButton>
      </div>
    </ToolShell>
  );
}
