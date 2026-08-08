import { useI18n } from "@/lib/i18n";

export function Testimonials() {
  const { t } = useI18n();
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-graphite/60">{t.testimonials.section}</p>
          <h2 className="mt-2 font-mono text-2xl font-bold text-ink sm:text-3xl">{t.testimonials.heading}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {t.testimonials.quotes.map((q) => (
            <figure key={q.name} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span aria-hidden className="font-mono text-4xl leading-none text-signal">“</span>
              <blockquote className="mt-2 text-sm leading-relaxed text-graphite">{q.q}</blockquote>
              <figcaption className="mt-5 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-widest text-ink">
                {q.name} <span className="text-graphite/60">· {q.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
