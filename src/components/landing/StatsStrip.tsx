import { useI18n } from "@/lib/i18n";

export function StatsStrip() {
  const { t } = useI18n();
  return (
    <section className="border-y border-ink/80 bg-paper-2/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {t.stats.items.map((s) => (
          <div key={s.label} className="text-center lg:text-start">
            <p className="font-mono text-4xl font-bold text-ink sm:text-5xl">{s.v}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-graphite/70">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
