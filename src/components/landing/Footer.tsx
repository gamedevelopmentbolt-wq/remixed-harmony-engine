import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { fmt, useI18n } from "@/lib/i18n";

export function Footer() {
  const { t, path } = useI18n();

  const cols = [
    {
      title: t.footer.cols.tools,
      links: [
        { label: t.footer.links.mergePdf, href: "/tools/merge-pdf" },
        { label: t.footer.links.splitPdf, href: "/tools/split-pdf" },
        { label: t.footer.links.compressPdf, href: "/tools/compress-pdf" },
        { label: t.footer.links.imageConverter, href: "/tools/image-converter" },
        { label: t.footer.links.qrGenerator, href: "/tools/qr-code-generator" },
      ],
    },
    {
      title: t.footer.cols.company,
      links: [
        { label: t.footer.links.about, href: "/about" },
        { label: t.footer.links.blog, href: "/blog" },
        { label: t.footer.links.changelog, href: "/changelog" },
        { label: t.footer.links.contact, href: "/contact" },
      ],
    },
    {
      title: t.footer.cols.explore,
      links: [
        { label: t.footer.links.aiPrompts, href: "/ai-prompts" },
        { label: t.footer.links.alternatives, href: "/vs" },
        { label: t.footer.links.rss, href: "/blog.rss.xml" },
      ],
    },
    {
      title: t.footer.cols.legal,
      links: [
        { label: t.footer.links.privacy, href: "/privacy" },
        { label: t.footer.links.terms, href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <a href={path("/")} className="inline-block rounded-md bg-paper px-3 py-2" aria-label={t.nav.home}>
              <Logo height={32} />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/70">{t.footer.tagline}</p>
            <div className="mt-5">
              <LanguageSwitcher />
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-paper/60">{c.title}</h3>
              <ul className="mt-4 space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-paper/85 hover:text-signal">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-paper/15 pt-6 font-mono text-[11px] uppercase tracking-widest text-paper/60 sm:flex-row sm:items-center">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <p>{t.footer.made}</p>
        </div>
      </div>
    </footer>
  );
}
