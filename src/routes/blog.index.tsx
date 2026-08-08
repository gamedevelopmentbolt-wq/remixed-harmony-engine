import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { posts, formatBlogDate, blogLangs, dirForLang, type BlogLang } from "@/lib/blog";
import { abs, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — EasyFileMagic · Practical File Tool Guides (EN · FR · DE · AR)" },
      {
        name: "description",
        content:
          "Guides on compressing PDFs, converting files, and using free browser-based tools. Articles in English, French, German and Arabic.",
      },
      { property: "og:title", content: "Blog — EasyFileMagic" },
      {
        property: "og:description",
        content: "Practical guides on PDFs, image conversion, OCR and other everyday file jobs — now in four languages.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: abs("/blog") },
      ...ogImageMeta(),
      { name: "twitter:title", content: "Blog — EasyFileMagic" },
      { name: "twitter:description", content: "Practical guides on PDFs, image conversion, OCR and other everyday file jobs — now in four languages." },
    ],
    links: [{ rel: "canonical", href: abs("/blog") }],
  }),
  component: BlogIndex,
});

type LangFilter = "all" | BlogLang;

function BlogIndex() {
  const [filter, setFilter] = useState<LangFilter>("all");
  const visible = filter === "all" ? posts : posts.filter((p) => (p.lang ?? "en") === filter);

  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main>
        <section className="border-b border-line bg-paper-2/60">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Section · Blog</p>
            <h1 className="mt-3 font-mono text-4xl font-bold text-ink sm:text-5xl">Field notes from the workshop</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-graphite/90">
              Short, practical guides on compressing PDFs, converting files, and getting more out of the browser-based
              tools you already use. Now available in English, French, German and Arabic.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Language</span>
              {(["all", ...blogLangs.map((l) => l.code)] as LangFilter[]).map((code) => {
                const cfg = code === "all" ? null : blogLangs.find((l) => l.code === code);
                const label = code === "all" ? "All" : cfg?.nativeLabel ?? code;
                const active = filter === code;
                return (
                  <button
                    type="button"
                    key={code}
                    onClick={() => setFilter(code)}
                    className={
                      active
                        ? "inline-flex h-8 items-center rounded-full border border-ink bg-ink px-3 font-mono text-[11px] uppercase tracking-widest text-paper"
                        : "inline-flex h-8 items-center rounded-full border border-line bg-white px-3 font-mono text-[11px] uppercase tracking-widest text-graphite/80 hover:border-ink"
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            {visible.length === 0 ? (
              <p className="text-center text-sm text-graphite/70">No articles yet in this language.</p>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2">
                {visible.map((p) => {
                  const lang: BlogLang = p.lang ?? "en";
                  const dir = dirForLang(lang);
                  const cfg = blogLangs.find((l) => l.code === lang);
                  return (
                    <li key={p.slug}>
                      <Link
                        to="/blog/$slug"
                        params={{ slug: p.slug }}
                        hrefLang={lang}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-ink"
                      >
                        <div className="aspect-[16/9] overflow-hidden bg-paper-2">
                          <img
                            src={p.hero.src}
                            alt={p.hero.alt}
                            width={1600}
                            height={900}
                            loading="lazy"
                            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-5" lang={lang} dir={dir}>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">
                              {formatBlogDate(p.date, lang)} · {p.readMinutes} min
                            </p>
                            <span className="inline-flex items-center rounded-full border border-signal/40 bg-signal/10 px-2 py-0 font-mono text-[10px] uppercase tracking-widest text-signal">
                              {cfg?.nativeLabel ?? lang}
                            </span>
                          </div>
                          <h2 className="mt-2 font-mono text-xl font-bold leading-snug text-ink">{p.title}</h2>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite/80">{p.description}</p>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {p.tags.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center rounded-full border border-line bg-paper-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-graphite/70"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-signal">
                            Read article <span aria-hidden>→</span>
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
