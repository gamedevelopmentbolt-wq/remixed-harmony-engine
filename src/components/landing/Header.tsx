import { Search } from "lucide-react";
import { Logo } from "@/components/Logo";
import { TrustBadge } from "@/components/TrustBadge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { tools } from "@/lib/tools";
import { fmt, useI18n } from "@/lib/i18n";

export function Header() {
  const { t, path } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href={path("/")} className="flex items-center" aria-label={t.nav.home}>
          <Logo height={34} />
        </a>

        <nav aria-label="Primary" className="ms-4 hidden items-center gap-5 md:flex">
          <a href={`${path("/")}#tools`} className="font-mono text-xs uppercase tracking-wider text-graphite/80 hover:text-ink">{t.nav.tools}</a>
          <a href={`${path("/")}#categories`} className="font-mono text-xs uppercase tracking-wider text-graphite/80 hover:text-ink">{t.nav.categories}</a>
          <a href="/blog" className="font-mono text-xs uppercase tracking-wider text-graphite/80 hover:text-ink">{t.nav.blog}</a>
          <a href="/ai-prompts" className="font-mono text-xs uppercase tracking-wider text-graphite/80 hover:text-ink">{t.nav.aiPrompts}</a>
          <a href={`${path("/")}#faq`} className="font-mono text-xs uppercase tracking-wider text-graphite/80 hover:text-ink">{t.nav.faq}</a>
        </nav>

        <div className="ms-auto hidden items-center gap-3 lg:flex">
          <TrustBadge variant="compact" />
          <label className="relative">
            <span className="sr-only">{t.nav.searchLabel}</span>
            <Search aria-hidden className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/50" />
            <input
              type="search"
              placeholder={fmt(t.nav.searchShort, { count: tools.length })}
              className="h-9 w-64 rounded-md border border-line bg-white ps-8 pe-3 font-sans text-sm text-graphite placeholder:text-graphite/40 focus:border-ink focus:outline-none"
              onChange={(e) => {
                const el = document.getElementById("tool-search-hero") as HTMLInputElement | null;
                if (el) {
                  el.value = e.target.value;
                  el.dispatchEvent(new Event("input", { bubbles: true }));
                }
              }}
            />
          </label>
        </div>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <LanguageSwitcher />
          <a
            href="#tools"
            className="inline-flex h-9 items-center rounded-md bg-signal px-4 font-mono text-xs font-bold uppercase tracking-wider text-signal-foreground shadow-sm transition hover:brightness-110"
          >
            {t.nav.openTool}
          </a>
        </div>
      </div>
    </header>
  );
}
