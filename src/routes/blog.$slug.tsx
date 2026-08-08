import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Globe } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  blogLangs,
  dirForLang,
  findPost,
  formatBlogDate,
  langLabel,
  posts,
  type BlogBlock,
  type BlogLang,
} from "@/lib/blog";
import { tools } from "@/lib/tools";
import { abs } from "@/lib/site";
import { ShareButtons } from "@/components/ShareButtons";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = findPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [{ title: "Article not found — EasyFileMagic" }, { name: "robots", content: "noindex" }],
      };
    }
    const url = abs(`/blog/${params.slug}`);
    const lang = post.lang ?? "en";
    const localeMap: Record<BlogLang, string> = { en: "en_US", fr: "fr_FR", de: "de_DE", ar: "ar_AR" };
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      inLanguage: lang,
      image: abs(post.hero.src),
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: "EasyFileMagic" },
      publisher: { "@type": "Organization", name: "EasyFileMagic" },
      mainEntityOfPage: url,
    };
    const scripts: { type: string; children: string }[] = [
      { type: "application/ld+json", children: JSON.stringify(articleLd) },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
            { "@type": "ListItem", position: 2, name: "Blog", item: abs("/blog") },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        }),
      },
    ];
    if (post.faqs && post.faqs.length > 0) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      });
    }

    // hreflang alternates — self + declared translations, plus x-default → en (or self if no en sibling).
    const links: { rel: string; href: string; hrefLang?: string }[] = [{ rel: "canonical", href: url }];
    links.push({ rel: "alternate", href: url, hrefLang: lang });
    if (post.translations) {
      for (const t of post.translations) {
        links.push({ rel: "alternate", href: abs(`/blog/${t.slug}`), hrefLang: t.lang });
      }
    }
    const enSibling =
      lang === "en"
        ? { slug: post.slug }
        : post.translations?.find((t) => t.lang === "en");
    links.push({
      rel: "alternate",
      href: enSibling ? abs(`/blog/${enSibling.slug}`) : url,
      hrefLang: "x-default",
    });

    return {
      meta: [
        { title: `${post.title} · EasyFileMagic Blog` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: abs(post.hero.src) },
        { property: "og:image:alt", content: post.hero.alt },
        { property: "og:site_name", content: "EasyFileMagic" },
        { property: "og:locale", content: localeMap[lang] },
        { property: "article:published_time", content: post.date },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.description },
        { name: "twitter:image", content: abs(post.hero.src) },
        { name: "twitter:image:alt", content: post.hero.alt },
      ],
      links,
      scripts,
    };
  },
  notFoundComponent: BlogNotFound,
  component: BlogPost,
});

function renderBlock(block: BlogBlock, i: number) {
  switch (block.type) {
    case "p":
      return (
        <p key={i} className="text-[17px] leading-[1.75] text-graphite" dangerouslySetInnerHTML={{ __html: block.html }} />
      );
    case "h2":
      return (
        <h2 key={i} id={block.id} className="mt-12 scroll-mt-24 font-mono text-2xl font-bold text-ink sm:text-3xl">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} id={block.id} className="mt-8 scroll-mt-24 font-mono text-lg font-bold text-ink sm:text-xl">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={i} className="list-disc space-y-2 ps-6 text-[17px] leading-[1.75] text-graphite marker:text-signal">
          {block.items.map((it, k) => (
            <li key={k} dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={i} className="list-decimal space-y-2 ps-6 text-[17px] leading-[1.75] text-graphite marker:font-mono marker:font-bold marker:text-signal">
          {block.items.map((it, k) => (
            <li key={k} dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote key={i} className="border-s-4 border-signal bg-paper-2/60 px-5 py-3 italic text-graphite">
          <p>{block.text}</p>
          {block.cite && <cite className="mt-2 block font-mono text-xs uppercase tracking-wider text-graphite/60">— {block.cite}</cite>}
        </blockquote>
      );
    case "figure":
      return (
        <figure key={i} className="my-8 overflow-hidden rounded-2xl border border-line bg-white">
          <img src={block.src} alt={block.alt} width={1600} height={900} loading="lazy" className="block w-full" />
          {block.caption && (
            <figcaption className="border-t border-line bg-paper-2/60 px-4 py-3 font-mono text-xs text-graphite/70">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "table":
      return (
        <figure key={i} className="my-8 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-paper-2/70">
                  {block.headers.map((h, k) => (
                    <th
                      key={k}
                      scope="col"
                      className="border-b border-line px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-ink"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="align-top">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={
                          c === 0
                            ? "border-b border-line px-4 py-3 font-medium text-ink"
                            : "border-b border-line px-4 py-3 text-graphite"
                        }
                        dangerouslySetInnerHTML={{ __html: cell }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="border-t border-line bg-paper-2/60 px-4 py-3 font-mono text-xs text-graphite/70">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}

function LanguageSwitcher({
  currentLang,
  currentSlug,
  translations,
}: {
  currentLang: BlogLang;
  currentSlug: string;
  translations: { lang: BlogLang; slug: string }[];
}) {
  const options = [{ lang: currentLang, slug: currentSlug }, ...translations];
  if (options.length < 2) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" dir="ltr">
      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-graphite/60">
        <Globe className="h-3 w-3" aria-hidden /> Also in
      </span>
      {options.map((o) => {
        const cfg = blogLangs.find((l) => l.code === o.lang);
        const active = o.slug === currentSlug;
        return (
          <Link
            key={o.lang}
            to="/blog/$slug"
            params={{ slug: o.slug }}
            hrefLang={o.lang}
            className={
              active
                ? "inline-flex items-center rounded-full border border-ink bg-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-paper"
                : "inline-flex items-center rounded-full border border-line bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-graphite/80 hover:border-ink"
            }
          >
            {cfg?.nativeLabel ?? o.lang}
          </Link>
        );
      })}
    </div>
  );
}

function BlogPost() {
  const loaderData = Route.useLoaderData() as { post: import("@/lib/blog").BlogPost };
  const { post } = loaderData;
  const lang: BlogLang = post.lang ?? "en";
  const dir = dirForLang(lang);
  const ctaTool = tools.find((t) => t.slug === post.cta.toolSlug);
  const otherPosts = posts.filter((p) => p.slug !== post.slug && (p.lang ?? "en") === lang).slice(0, 3);
  const translations = post.translations ?? [];

  const t = {
    all: lang === "fr" ? "← Tous les articles" : lang === "de" ? "← Alle Artikel" : lang === "ar" ? "← كل المقالات" : "← All articles",
    minRead: lang === "fr" ? "min de lecture" : lang === "de" ? "Min. Lesezeit" : lang === "ar" ? "دقيقة قراءة" : "min read",
    inShort: lang === "fr" ? "En bref" : lang === "de" ? "Kurz gesagt" : lang === "ar" ? "باختصار" : "In short",
    faqTitle: lang === "fr" ? "Questions fréquentes" : lang === "de" ? "Häufig gestellte Fragen" : lang === "ar" ? "الأسئلة الشائعة" : "Frequently asked questions",
    recommendedTool: lang === "fr" ? "Outil recommandé" : lang === "de" ? "Empfohlenes Werkzeug" : lang === "ar" ? "أداة موصى بها" : "Recommended tool",
    open: lang === "fr" ? "Ouvrir" : lang === "de" ? "Öffnen" : lang === "ar" ? "افتح" : "Open",
    more: lang === "fr" ? "Plus depuis l'atelier" : lang === "de" ? "Weitere Artikel" : lang === "ar" ? "المزيد من الورشة" : "More from the workshop",
    sources: lang === "fr" ? "Sources & lectures" : lang === "de" ? "Quellen & Lektüre" : lang === "ar" ? "المصادر والمزيد للقراءة" : "Sources & further reading",
  };

  return (
    <div className="min-h-screen bg-paper text-graphite" lang={lang} dir={dir}>
      <Header />
      <main>
        <article>
          <header className="border-b border-line bg-paper-2/60">
            <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
              <Link
                to="/blog"
                className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
              >
                {t.all}
              </Link>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
                {formatBlogDate(post.date, lang)} · {post.readMinutes} {t.minRead}
              </p>
              <h1 className="mt-3 font-mono text-3xl font-bold leading-[1.15] text-ink sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-graphite/85">{post.description}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-line bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-graphite/70"
                  >
                    {tag}
                  </span>
                ))}
                <span className="inline-flex items-center rounded-full border border-signal/40 bg-signal/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-signal">
                  {langLabel(lang)}
                </span>
              </div>
              <LanguageSwitcher currentLang={lang} currentSlug={post.slug} translations={translations} />
            </div>
            <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
              <img
                src={post.hero.src}
                alt={post.hero.alt}
                width={1600}
                height={900}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full overflow-hidden rounded-2xl border border-line bg-white object-cover"
              />

            </div>
          </header>

          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            {post.summary && (
              <aside className="mb-10 rounded-xl border-s-4 border-signal bg-paper-2/70 p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">{t.inShort}</p>
                <p className="mt-2 text-[17px] leading-[1.6] text-ink">{post.summary}</p>
              </aside>
            )}
            <div className="space-y-5">{post.body.map(renderBlock)}</div>

            {post.faqs && post.faqs.length > 0 && (
              <section className="mt-14 border-t border-line pt-8">
                <h2 className="font-mono text-2xl font-bold text-ink sm:text-3xl">{t.faqTitle}</h2>
                <dl className="mt-6 space-y-6">
                  {post.faqs.map((f) => (
                    <div key={f.q}>
                      <dt className="font-mono text-base font-bold text-ink">{f.q}</dt>
                      <dd className="mt-2 text-[17px] leading-[1.7] text-graphite">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <div className="mt-10 border-t border-line pt-6">
              <ShareButtons url={abs(`/blog/${post.slug}`)} title={post.title} text={post.summary ?? post.description} />
            </div>

            {ctaTool && (
              <aside className="mt-14 overflow-hidden rounded-2xl border-2 border-signal bg-ink text-paper">
                <div className="p-6 sm:p-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">{t.recommendedTool}</p>
                  <h2 className="mt-2 font-mono text-2xl font-bold text-paper sm:text-3xl">{post.cta.heading}</h2>
                  <p className="mt-3 max-w-2xl text-paper/80">{post.cta.body}</p>
                  <Link
                    to="/tools/$slug"
                    params={{ slug: ctaTool.slug }}
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-signal px-5 font-mono text-sm font-bold uppercase tracking-wider text-signal-foreground shadow transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                  >
                    {t.open} {ctaTool.name} <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </aside>
            )}

            {post.sources.length > 0 && (
              <section className="mt-14 border-t border-line pt-8">
                <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink">
                  {t.sources}
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {post.sources.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-graphite underline underline-offset-4 hover:text-signal"
                      >
                        {s.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>

        {otherPosts.length > 0 && (
          <section className="border-t border-line bg-paper-2/60">
            <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
              <h2 className="font-mono text-lg font-bold text-ink">{t.more}</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {otherPosts.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      className="block rounded-xl border border-line bg-white p-4 hover:border-ink"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                        {formatBlogDate(p.date, lang)}
                      </p>
                      <p className="mt-2 font-mono text-base font-bold text-ink">{p.title}</p>
                      <p className="mt-2 text-sm text-graphite/80 line-clamp-2">{p.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function BlogNotFound() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Blog</p>
        <h1 className="mt-3 font-mono text-4xl font-bold text-ink">Article not found</h1>
        <p className="mt-4 text-graphite/80">We couldn't find an article at that address.</p>
        <Link
          to="/blog"
          className="mt-8 inline-flex h-10 items-center rounded-md border border-ink px-4 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
        >
          ← Back to the blog
        </Link>
      </div>
      <Footer />
    </div>
  );
}
