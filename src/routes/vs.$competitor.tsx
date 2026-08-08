import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, X, Minus, ArrowRight } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { comparisonTargets, findComparison } from "@/lib/comparisons";
import { tools } from "@/lib/tools";
import { abs, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/vs/$competitor")({
  loader: ({ params }) => {
    const c = findComparison(params.competitor);
    if (!c) throw notFound();
    return { c };
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.c;
    if (!c) return { meta: [{ title: "Comparison — EasyFileMagic" }, { name: "robots", content: "noindex" }] };
    const url = abs(`/vs/${params.competitor}`);
    return {
      meta: [
        { title: c.metaTitle },
        { name: "description", content: c.metaDescription },
        { property: "og:title", content: c.metaTitle },
        { property: "og:description", content: c.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...ogImageMeta(),
        { name: "twitter:title", content: c.metaTitle },
        { name: "twitter:description", content: c.metaDescription },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "Alternatives", item: abs("/vs") },
              { "@type": "ListItem", position: 3, name: `EasyFileMagic vs ${c.competitorName}`, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: ComparisonPage,
  notFoundComponent: NotFoundView,
});

function VerdictCell({ advantage, side }: { advantage: "efm" | "competitor" | "tie"; side: "efm" | "competitor" }) {
  if (advantage === "tie") {
    return <Minus aria-label="Tie" className="h-4 w-4 text-graphite/40" />;
  }
  if (advantage === side) {
    return <Check aria-label="Wins on this row" className="h-4 w-4 text-signal" />;
  }
  return <X aria-label="Loses on this row" className="h-4 w-4 text-graphite/30" />;
}

function ComparisonPage() {
  const { c } = Route.useLoaderData() as {
    c: import("@/lib/comparisons").ComparisonTarget;
  };
  const ctaTools = c.ctaToolSlugs
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const updatedLabel = c.updated
    ? new Date(c.updated).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-line bg-paper-2/60">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Section · Comparison</p>
            <h1 className="mt-3 font-mono text-4xl font-bold text-ink sm:text-5xl">
              EasyFileMagic vs {c.competitorName}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-graphite/90">{c.tldr}</p>
            {updatedLabel && (
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-graphite/60">
                Updated {updatedLabel} · Honest comparison, not a paid review
              </p>
            )}

            <div className="mt-6 rounded-md border border-line bg-white p-4 text-sm leading-relaxed text-graphite">
              <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Quick answer</p>
              <p className="mt-1">{c.quickAnswer}</p>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-mono text-2xl font-bold text-ink">Feature-by-feature</h2>
            <div className="mt-6 overflow-hidden rounded-md border border-line bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper-2/60 font-mono text-[10px] uppercase tracking-widest text-graphite/70">
                    <th className="px-4 py-3 sm:w-1/3">Feature</th>
                    <th className="px-4 py-3">EasyFileMagic</th>
                    <th className="px-4 py-3">{c.competitorName}</th>
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((r, i) => (
                    <tr
                      key={r.feature}
                      className={i % 2 === 0 ? "bg-white" : "bg-paper-2/30"}
                    >
                      <td className="px-4 py-3 align-top font-medium text-ink">{r.feature}</td>
                      <td className="px-4 py-3 align-top text-graphite/90">
                        <div className="flex items-start gap-2">
                          <VerdictCell advantage={r.advantage} side="efm" />
                          <span>{r.efm}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-graphite/90">
                        <div className="flex items-start gap-2">
                          <VerdictCell advantage={r.advantage} side="competitor" />
                          <span>{r.competitor}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Honest recommendations */}
        <section className="border-b border-line bg-paper-2/40">
          <div className="mx-auto grid max-w-4xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
            <div className="rounded-md border border-line bg-white p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Choose EasyFileMagic when</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-graphite">
                {c.whenWeWin.map((s) => (
                  <li key={s} className="flex gap-2">
                    <Check aria-hidden className="mt-0.5 h-4 w-4 flex-none text-signal" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-line bg-white p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                Choose {c.competitorName} when
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-graphite">
                {c.whenTheyWin.map((s) => (
                  <li key={s} className="flex gap-2">
                    <Check aria-hidden className="mt-0.5 h-4 w-4 flex-none text-graphite/50" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA — relevant tools */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-mono text-2xl font-bold text-ink">Try the tools people usually switch for</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {ctaTools.map((t) => (
                <li key={t.slug}>
                  <Link
                    to="/tools/$slug"
                    params={{ slug: t.slug }}
                    className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-4 py-3 text-sm transition hover:border-ink"
                  >
                    <span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                        {t.category}
                      </span>
                      <span className="mt-0.5 block font-mono text-base font-semibold text-ink">{t.name}</span>
                      <span className="mt-1 block text-graphite/80">{t.description}</span>
                    </span>
                    <ArrowRight aria-hidden className="h-4 w-4 flex-none text-signal" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tool-by-tool coverage */}
        {c.toolCoverage && (
          <section className="border-b border-line">
            <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
              <h2 className="font-mono text-2xl font-bold text-ink">
                Which {c.toolCoverage.label} each side offers
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-md border border-line bg-white p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-signal">
                    EasyFileMagic · {ourCoverageTools.length} tools
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {ourCoverageTools.map((t) => (
                      <li key={t.slug}>
                        <Link
                          to="/tools/$slug"
                          params={{ slug: t.slug }}
                          className="inline-block rounded-full border border-line px-3 py-1 text-xs text-graphite hover:border-ink hover:text-ink"
                        >
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-line bg-white p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                    {c.competitorName} · {c.toolCoverage.competitorTools.length} tools listed
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.toolCoverage.competitorTools.map((name) => (
                      <li
                        key={name}
                        className="inline-block rounded-full border border-line px-3 py-1 text-xs text-graphite/80"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {c.toolCoverage.note && (
                <p className="mt-5 text-sm leading-relaxed text-graphite/90">{c.toolCoverage.note}</p>
              )}
            </div>
          </section>
        )}

        {/* Other comparisons */}
        <section className="border-b border-line bg-paper-2/40">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-mono text-lg font-bold text-ink">More comparisons</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {comparisonTargets
                .filter((o) => o.slug !== c.slug)
                .map((o) => (
                  <li key={o.slug}>
                    <Link
                      to="/vs/$competitor"
                      params={{ competitor: o.slug }}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-graphite hover:border-ink"
                    >
                      vs {o.competitorName} <ArrowRight aria-hidden className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Comparison</p>
        <h1 className="mt-3 font-mono text-4xl font-bold text-ink">No comparison at that address</h1>
        <p className="mt-4 text-graphite/80">Try one of the ones we have:</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-3">
          {comparisonTargets.map((o) => (
            <li key={o.slug}>
              <Link
                to="/vs/$competitor"
                params={{ competitor: o.slug }}
                className="inline-flex items-center rounded-md border border-ink px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
              >
                vs {o.competitorName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </div>
  );
}