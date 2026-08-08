import { Globe } from "lucide-react";
import { LOCALES, LOCALE_META, localePath, useI18n, type Locale } from "@/lib/i18n";

/**
 * Locale picker. Navigates to the same page under the target locale prefix
 * (English is unprefixed) with a full navigation so <html lang/dir> is correct.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();

  const go = (next: Locale) => {
    if (typeof window === "undefined") return;
    const current = window.location.pathname;
    const stripped = current.replace(/^\/(fr|es|ar)(?=\/|$)/, "") || "/";
    window.location.assign(localePath(next, stripped) + window.location.hash);
  };

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t.nav.changeLanguage}</span>
      <Globe
        aria-hidden
        className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/60"
      />
      <select
        value={locale}
        onChange={(e) => go(e.target.value as Locale)}
        aria-label={t.nav.changeLanguage}
        className="h-9 appearance-none rounded-md border border-line bg-white ps-8 pe-3 font-mono text-xs uppercase tracking-wider text-ink hover:border-ink focus:border-ink focus:outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={LOCALE_META[l].tag}>
            {LOCALE_META[l].label}
          </option>
        ))}
      </select>
    </label>
  );
}
