import { getI18n, langLabels } from "@/lib/tool-i18n";

interface Props { slug: string }

export function InternationalKeywords({ slug }: Props) {
  const i18n = getI18n(slug);
  if (!i18n) return null;
  const entries = (["fr", "de", "ar"] as const).filter((l) => i18n[l]);
  if (entries.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-mono text-lg font-bold text-ink">International</h2>
      <p className="mt-1 text-sm text-graphite/80">This tool is also indexed for French, German and Arabic keywords.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {entries.map((l) => {
          const meta = i18n[l]!;
          const cfg = langLabels[l];
          return (
            <article key={l} dir={cfg.dir} lang={l}
              className="rounded-xl border border-line bg-white p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal">{cfg.name}</p>
              <h3 className="mt-1 font-mono text-sm font-bold text-ink">{meta.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite">{meta.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
