import { Search } from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { tools, type ToolCategory } from "@/lib/tools";
import { fmt, useI18n } from "@/lib/i18n";

/** Top categories surfaced as one-tap chips right under the search field. */
const HERO_CATS = [
  { key: "AI", dictKey: "AI" },
  { key: "PDF", dictKey: "PDF" },
  { key: "Image", dictKey: "Image" },
  { key: "Convert", dictKey: "Convert" },
  { key: "Data & Utility", dictKey: "DataUtility" },
] as const;

interface HeroProps {
  query: string;
  onQueryChange: (v: string) => void;
  onCategorySelect?: (c: ToolCategory) => void;
}

export function Hero({ query, onQueryChange, onCategorySelect }: HeroProps) {
  const { t } = useI18n();


  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="blueprint-grid absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-graphite/70">
              <span className="me-2 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />
              {fmt(t.hero.eyebrow, { count: tools.length })}
            </p>
            <h1 className="mt-3 font-mono text-3xl font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {t.hero.headline} <span className="text-signal">{t.hero.headlineAccent}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-graphite/90 sm:text-lg">
              {t.hero.lead.split(t.hero.leadStrong).map((chunk, i, arr) => (
                <span key={i}>
                  {chunk}
                  {i < arr.length - 1 && <strong className="text-ink">{t.hero.leadStrong}</strong>}
                </span>
              ))}
            </p>

            {/* Primary CTA — kept directly under the headline so it is visible
                without scrolling on phone-sized viewports. */}
            <div className="mt-5 max-w-xl">
              <label className="relative block">
                <span className="sr-only">{t.nav.searchLabel}</span>
                <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-graphite/50" />
                <input
                  id="tool-search-hero"
                  type="search"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder={fmt(t.hero.searchPlaceholder, { count: tools.length })}
                  className="h-12 w-full rounded-lg border border-line bg-white ps-11 pe-4 font-sans text-base text-graphite placeholder:text-graphite/40 shadow-sm focus:border-ink focus:outline-none"
                />
              </label>
            </div>

            <nav aria-label={t.categories.heading} className="mt-4 flex flex-wrap gap-2">
              {HERO_CATS.map((c) => (
                <a
                  key={c.key}
                  href="#tools"
                  onClick={() => onCategorySelect?.(c.key)}
                  className="inline-flex h-9 items-center rounded-full border border-ink/25 bg-white px-3.5 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {t.categories.items[c.dictKey].name}
                  <span className="ms-2 opacity-60">
                    {tools.filter((tool) => tool.category === c.key).length}
                  </span>
                </a>
              ))}
            </nav>

            <div className="mt-5">
              <TrustBadge variant="full" />
            </div>


            <ul className="mt-6 flex flex-wrap gap-2">
              {t.hero.badges.map((b) => (
                <li
                  key={b}
                  className="inline-flex items-center rounded-full border border-line bg-white/70 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:flex lg:justify-end lg:pt-6">
            <div className="stamp-badge h-36 w-36 text-center leading-tight">
              {t.hero.stamp.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < t.hero.stamp.length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
