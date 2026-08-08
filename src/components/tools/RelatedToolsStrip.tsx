import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getRelatedTools } from "@/lib/related-tools";

/**
 * Prominent bottom-of-page "Related tools" strip. Gives single-task visitors
 * an obvious next step instead of a dead end after one conversion.
 */
export function RelatedToolsStrip({ slug, limit = 6 }: { slug: string; limit?: number }) {
  const related = getRelatedTools(slug, limit);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading" className="mt-14 border-t border-line pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">Keep going</p>
          <h2 id="related-tools-heading" className="mt-1 font-mono text-xl font-bold text-ink">
            Related tools
          </h2>
        </div>
        <Link
          to="/"
          hash="tools"
          className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
        >
          Browse all tools <span aria-hidden className="inline-block rtl:rotate-180">→</span>
        </Link>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((r) => (
          <li key={r.slug}>
            <Link
              to="/tools/$slug"
              params={{ slug: r.slug }}
              className="group flex h-full flex-col rounded-xl border border-line bg-white p-4 transition-colors hover:border-ink"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/55">
                {r.category}
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-ink">{r.name}</p>
              <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-graphite/80">
                {r.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-signal">
                Open <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
