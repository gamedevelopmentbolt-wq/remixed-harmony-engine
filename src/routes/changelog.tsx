import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { changelog } from "@/lib/changelog";
import { abs, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — EasyFileMagic (What's New)" },
      {
        name: "description",
        content:
          "Everything new on EasyFileMagic — new tools, new blog posts, performance improvements and bug fixes. Updated regularly.",
      },
      { property: "og:title", content: "EasyFileMagic Changelog — what's new" },
      {
        property: "og:description",
        content: "A running log of new tools, blog posts and improvements shipped to EasyFileMagic.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: abs("/changelog") },
      ...ogImageMeta(),
      { name: "twitter:title", content: "EasyFileMagic Changelog — what's new" },
      { name: "twitter:description", content: "A running log of new tools, blog posts and improvements shipped to EasyFileMagic." },
    ],
    links: [{ rel: "canonical", href: abs("/changelog") }],
  }),
  component: ChangelogPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ChangelogPage() {
  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main>
        <section className="border-b border-line bg-paper-2/60">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Section · Changelog</p>
            <h1 className="mt-3 font-mono text-4xl font-bold text-ink sm:text-5xl">What's new</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-graphite/90">
              A running log of new tools, blog posts, performance work and small polish shipped to EasyFileMagic.
              Nothing marketing, just what changed.
            </p>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <ol className="space-y-10">
              {changelog.map((e) => (
                <li key={`${e.date}-${e.title}`} className="border-l-2 border-signal/40 pl-6">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">
                    {formatDate(e.date)}
                  </p>
                  <h2 className="mt-1 font-mono text-xl font-bold text-ink">{e.title}</h2>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-graphite/90">
                    {e.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}