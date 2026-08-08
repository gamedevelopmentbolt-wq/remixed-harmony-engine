import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Pencil } from "lucide-react";
import { tools } from "@/lib/tools";

const FEATURED = [
  { slug: "timestamp-converter", icon: Clock, tag: "Most used by developers" },
  { slug: "pdf-editor", icon: Pencil, tag: "Free — no paywall" },
] as const;

/** Two hand-picked, high-engagement tools surfaced directly under the hero. */
export function FeaturedTools() {
  return (
    <section aria-labelledby="featured-tools-heading" className="border-b border-line bg-paper-2/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2
          id="featured-tools-heading"
          className="font-mono text-xs uppercase tracking-[0.18em] text-graphite/60"
        >
          Most popular right now
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FEATURED.map(({ slug, icon: Icon, tag }) => {
            const tool = tools.find((t) => t.slug === slug);
            if (!tool) return null;
            return (
              <Link
                key={slug}
                to="/tools/$slug"
                params={{ slug }}
                className="group flex items-start gap-4 rounded-lg border border-line bg-white p-5 shadow-sm transition-colors hover:border-ink"
              >
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-paper-2 text-ink">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-signal">{tag}</span>
                  <span className="mt-1 flex items-center gap-2 font-mono text-base font-bold text-ink">
                    {tool.name}
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-graphite/90">{tool.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
