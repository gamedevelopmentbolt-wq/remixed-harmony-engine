import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { type Tool } from "@/lib/tools";
import { getToolContent } from "@/lib/tool-content";
import { LocalProcessingNote } from "./LocalProcessingNote";
import { InternationalKeywords } from "@/components/InternationalKeywords";
import { RelatedToolsStrip } from "./RelatedToolsStrip";
import { ToolGuideLinks } from "./ToolGuideLinks";

import { ShareButtons } from "@/components/ShareButtons";
import { abs } from "@/lib/site";
import {
  clearLastDownload,
  downloadBlob,
  formatBytes,
  subscribeLastDownload,
  type LastDownload,
} from "@/lib/tool-utils";

interface ToolShellProps {
  tool: Tool;
  children: ReactNode;
  status?: { kind: "idle" | "working" | "success" | "error"; message?: string; progress?: number };
  howItWorks: [string, string, string];
}

export function ToolShell({ tool, children, status, howItWorks }: ToolShellProps) {
  const [lastResult, setLastResult] = useState<LastDownload | null>(null);

  useEffect(() => {
    // Clear any leftover result from a previously visited tool.
    clearLastDownload();
    const unsub = subscribeLastDownload(setLastResult);
    return () => {
      unsub();
      clearLastDownload();
    };
  }, [tool.slug]);

  const content = getToolContent(tool.slug);


  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-line bg-paper-2/60">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Link to="/" className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink">
            ← Back to all tools
          </Link>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-signal">
            TOOL · {tool.n} · {tool.category}
          </p>
          <h1 className="mt-2 font-mono text-3xl font-bold text-ink sm:text-4xl">{tool.name}</h1>
          <p className="mt-2 max-w-2xl text-graphite/85">{tool.description}</p>
          {content.summary && (
            <p className="mt-4 max-w-2xl rounded-lg border-l-4 border-signal bg-white/70 p-3 text-sm text-ink">
              <strong className="font-mono text-[11px] uppercase tracking-widest text-signal">In short</strong>
              <br />
              {content.summary}
            </p>
          )}
          <LocalProcessingNote network={tool.network} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="pegboard-card !p-6 sm:!p-8">
          <div className="mt-2 space-y-5">{children}</div>

          {lastResult && (
            <div className="sticky bottom-3 z-10 mt-6 overflow-hidden rounded-xl border-2 border-signal bg-ink text-paper shadow-lg">
              <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-workshop px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-paper">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Ready
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-bold text-paper">{lastResult.filename}</p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-paper/60">
                    {formatBytes(lastResult.size)} · saved to your device
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadBlob(lastResult.blob, lastResult.filename)}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-signal px-5 font-mono text-sm font-bold uppercase tracking-wider text-signal-foreground shadow transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  <span className="max-w-[16rem] truncate">Download {lastResult.filename}</span>
                </button>
              </div>
            </div>
          )}

          {(lastResult || status?.kind === "success") && (
            <div className="mt-6 rounded-xl border border-line bg-paper-2/60 p-4">
              <ShareButtons
                url={abs(`/tools/${tool.slug}`)}
                title={`${tool.name} — free, private, in your browser · EasyFileMagic`}
                text={`Just used ${tool.name} on EasyFileMagic — free and runs right in the browser.`}
              />
            </div>
          )}

          {status && status.kind !== "idle" && (
            <div
              role="status"
              className={
                "mt-6 flex items-start gap-3 rounded-xl border p-4 " +
                (status.kind === "error"
                  ? "border-destructive/40 bg-destructive/5 text-destructive"
                  : status.kind === "success"
                    ? "border-workshop/40 bg-workshop/5 text-workshop"
                    : "border-ink/20 bg-paper-2 text-ink")
              }
            >
              {status.kind === "working" ? (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" aria-hidden />
              ) : status.kind === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm">{status.message ?? ""}</p>
                {typeof status.progress === "number" && status.kind === "working" && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full bg-signal transition-all"
                      style={{ width: `${Math.max(2, Math.min(100, status.progress))}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <section className="mt-12">
          <h2 className="font-mono text-lg font-bold text-ink">How it works</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {howItWorks.map((step, i) => (
              <li key={i} className="rounded-xl border border-line bg-white p-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-signal">
                  Step · {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm text-graphite">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {content.faqs && content.faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="font-mono text-lg font-bold text-ink">Frequently asked questions</h2>
            <dl className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
              {content.faqs.map((f) => (
                <div key={f.q} className="p-5">
                  <dt className="font-mono text-sm font-bold text-ink">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-graphite">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <ToolGuideLinks slug={tool.slug} category={tool.category} />

        <RelatedToolsStrip slug={tool.slug} />

        <InternationalKeywords slug={tool.slug} />

      </div>
    </div>
  );
}

export interface ToolStatus {
  kind: "idle" | "working" | "success" | "error";
  message?: string;
  progress?: number;
}

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function PrimaryButton({
  children,
  loading,
  loadingText,
  disabled,
  className,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={
        "inline-flex h-12 min-w-[10rem] items-center justify-center gap-2 rounded-md bg-signal px-6 font-mono text-sm font-bold uppercase tracking-wider text-signal-foreground shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 " +
        (className ?? "")
      }
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>{loadingText ?? "Processing…"}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={
        "inline-flex h-11 items-center justify-center rounded-md border border-ink bg-white px-5 font-mono text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-50 " +
        (className ?? "")
      }
    >
      {children}
    </button>
  );
}
