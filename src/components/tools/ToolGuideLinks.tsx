import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { getToolGuides } from "@/lib/tool-guides";

/**
 * Editorial outbound links on a tool page. Gives crawlers a path from every
 * tool into the blog (and readers a reason to stay past one conversion).
 */
export function ToolGuideLinks({ slug, category }: { slug: string; category?: string }) {
  const guides = getToolGuides(slug, category);
  if (guides.length === 0) return null;

  return (
    <section aria-labelledby="tool-guides-heading" className="mt-12">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <h2 id="tool-guides-heading" className="min-w-0 font-mono text-lg font-bold text-ink">
          Read the guide
        </h2>
        <Link
          to="/blog"
          className="shrink-0 font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
        >
          All articles →
        </Link>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: g.slug }}
              className="flex h-full gap-3 rounded-xl border border-line bg-white p-4 transition hover:border-ink"
            >
              <BookOpen aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <span className="min-w-0">
                <span className="block font-mono text-sm font-bold leading-snug text-ink">{g.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-graphite/85">{g.description}</span>
                <span className="mt-2 block font-mono text-[11px] uppercase tracking-widest text-graphite/60">
                  {g.readMinutes} min read
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
