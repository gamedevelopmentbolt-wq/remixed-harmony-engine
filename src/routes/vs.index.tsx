import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { comparisonTargets } from "@/lib/comparisons";
import { abs, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/vs/")({
  head: () => ({
    meta: [
      { title: "EasyFileMagic Alternatives — Honest Comparisons (iLovePDF, Smallpdf, Adobe)" },
      {
        name: "description",
        content:
          "Honest, feature-by-feature comparisons of EasyFileMagic vs iLovePDF, Smallpdf and Adobe Acrobat online tools. Free, no signup, files stay in your browser.",
      },
      { property: "og:title", content: "EasyFileMagic vs the popular PDF tools — honest comparison" },
      {
        property: "og:description",
        content:
          "See how EasyFileMagic stacks up against the big-name PDF suites — feature by feature, with no marketing spin.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: abs("/vs") },
      ...ogImageMeta(),
      { name: "twitter:title", content: "EasyFileMagic vs the popular PDF tools — honest comparison" },
      { name: "twitter:description", content: "See how EasyFileMagic stacks up against the big-name PDF suites — feature by feature, with no marketing spin." },
    ],
    links: [{ rel: "canonical", href: abs("/vs") }],
  }),
  component: VsIndex,
});

function VsIndex() {
  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main>
        <section className="border-b border-line bg-paper-2/60">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Section · Alternatives</p>
            <h1 className="mt-3 font-mono text-4xl font-bold text-ink sm:text-5xl">Honest comparisons</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-graphite/90">
              Feature-by-feature comparisons between EasyFileMagic and the popular PDF suites. No marketing spin —
              where the other tool is genuinely better for your use case, we say so.
            </p>
          </div>
        </section>
        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <ul className="grid gap-4 sm:grid-cols-2">
              {comparisonTargets.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/vs/$competitor"
                    params={{ competitor: c.slug }}
                    className="flex h-full flex-col justify-between rounded-md border border-line bg-white p-5 transition hover:border-ink"
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-signal">vs</p>
                      <h2 className="mt-1 font-mono text-2xl font-bold text-ink">{c.competitorName}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-graphite/90">{c.tldr}</p>
                    </div>
                    <p className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink">
                      Read the comparison <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                    </p>
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