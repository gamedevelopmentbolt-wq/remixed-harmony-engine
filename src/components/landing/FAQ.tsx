import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function FAQ() {
  const { t } = useI18n();
  return (
    <section id="faq" className="border-b border-line bg-paper-2/60">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-graphite/60">{t.faq.section}</p>
          <h2 className="mt-2 font-mono text-2xl font-bold text-ink sm:text-3xl">{t.faq.heading}</h2>
        </div>
        <div className="divide-y divide-line rounded-2xl border border-line bg-white">
          {t.faq.items.map((item, i) => (
            <details key={i} className="group px-5 py-4 open:bg-paper-2/40">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-mono text-sm font-bold text-ink list-none">
                <span>{item.q}</span>
                <Plus aria-hidden className="h-4 w-4 shrink-0 text-graphite transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-graphite/90">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
