import { tools } from "@/lib/tools";
import { fmt, useI18n } from "@/lib/i18n";

const cats = [
  { n: "01", key: "AI", dictKey: "AI" },
  { n: "02", key: "PDF", dictKey: "PDF" },
  { n: "03", key: "Image", dictKey: "Image" },
  { n: "04", key: "Convert", dictKey: "Convert" },
  { n: "05", key: "Data & Utility", dictKey: "DataUtility" },
] as const;

export function CategoryGrid() {
  const { t } = useI18n();

  return (
    <section id="categories" className="border-b border-line bg-paper-2/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-graphite/60">{t.categories.section}</p>
            <h2 className="mt-2 font-mono text-2xl font-bold text-ink sm:text-3xl">{t.categories.heading}</h2>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-graphite/60">
            {fmt(t.categories.total, { count: tools.length })}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cats.map((c) => {
            const count = tools.filter((tool) => tool.category === c.key).length;
            const copy = t.categories.items[c.dictKey];
            return (
              <a
                key={c.n}
                href="#tools"
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-ink p-6 text-paper transition hover:bg-[#1a2a4d]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -end-2 -top-4 font-mono text-[7rem] font-bold leading-none text-paper/5"
                >
                  {c.n}
                </span>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-paper/60">
                    {fmt(t.categories.catLabel, { n: c.n, count })}
                  </p>
                  <h3 className="mt-2 font-mono text-xl font-bold text-paper">{copy.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/75">{copy.desc}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-signal">
                  {t.categories.viewTools} <span aria-hidden className="inline-block rtl:rotate-180">→</span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
