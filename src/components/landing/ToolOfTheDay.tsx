import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { tools } from "@/lib/tools";
import { iconMap } from "@/components/landing/ToolGrid";
import { useI18n } from "@/lib/i18n";

/**
 * Always-visible on the homepage anyway, so we surface tools already
 * promoted above the fold to avoid dupes.
 */
const ALREADY_FEATURED = new Set(["timestamp-converter", "pdf-editor"]);

/** Deterministic per-day pick: day-of-year modulo the candidate list. */
function pickToday() {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start) / 86_400_000); // 1..366
  const pool = tools.filter((t) => !ALREADY_FEATURED.has(t.slug));
  if (pool.length === 0) return null;
  return pool[(dayOfYear - 1) % pool.length];
}

/** Small "Tool of the day" card — rotates daily, no database, no API. */
export function ToolOfTheDay() {
  const { t } = useI18n();
  const tool = pickToday();
  if (!tool) return null;
  const Icon = iconMap[tool.icon] ?? iconMap.Files;

  return (
    <section aria-labelledby="tool-of-the-day-heading" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/tools/$slug"
          params={{ slug: tool.slug }}
          className="group flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-dashed border-ink/25 bg-paper-2/60 px-5 py-4 transition-colors hover:border-ink"
        >
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
            <Sparkles aria-hidden className="h-4 w-4" />
            {t.toolOfTheDay.label}
          </span>
          <span className="inline-flex items-center gap-3 min-w-0 flex-1">
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-white text-ink"
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-base font-bold text-ink">
                {tool.name}
                <ArrowRight
                  aria-hidden
                  className="mb-0.5 ml-1.5 inline h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100"
                />
              </span>
              <span className="block truncate text-sm text-graphite/80">{tool.description}</span>
            </span>
          </span>
          <span className="ml-auto font-mono text-[11px] uppercase tracking-wider text-graphite/60">
            {tool.category}
          </span>
        </Link>
      </div>
    </section>
  );
}
