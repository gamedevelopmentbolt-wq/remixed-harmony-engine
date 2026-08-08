import { useI18n } from "@/lib/i18n";

export function WhySection() {
  const { t } = useI18n();
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-graphite/60">{t.why.section}</p>
          <h2 className="mt-2 font-mono text-2xl font-bold text-ink sm:text-3xl">{t.why.heading}</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.items.map((i, idx) => (
            <div key={i.title} className="border-t-2 border-ink pt-5">
              <p className="font-mono text-xs uppercase tracking-widest text-signal">
                {String(idx + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-mono text-lg font-bold text-ink">{i.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite/85">{i.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
