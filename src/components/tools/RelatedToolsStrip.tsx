import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getRelatedTools } from "@/lib/related-tools";
import { useI18n } from "@/lib/i18n";

/**
 * Bottom-of-page "You might also need" strip. Gives single-task visitors an
 * obvious next step and creates topical internal links between tool pages.
 */
export function RelatedToolsStrip({ slug, limit = 4 }: { slug: string; limit?: number }) {
  const { t, path } = useI18n();
  const related = getRelatedTools(slug, limit);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading" className="mt-14 border-t border-line pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
            {t.relatedTools.eyebrow}
          </p>
          <h2 id="related-tools-heading" className="mt-1 font-mono text-xl font-bold text-ink">
            {t.relatedTools.heading}
          </h2>
        </div>
        <Link
          to={path("/")}
          hash="tools"
          className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
        >
          {t.relatedTools.browseAll} <span aria-hidden className="inline-block rtl:rotate-180">→</span>
        </Link>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((r) => (
          <li key={r.slug}>
            <Link
              to={path(`/tools/${r.slug}`)}
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
                {t.relatedTools.open} <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
