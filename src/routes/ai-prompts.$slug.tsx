import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Copy, Sparkles } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { aiPrompts, promptCategories, type AiPrompt } from "@/lib/ai-prompts";
import { abs } from "@/lib/site";

const byId = (slug: string): AiPrompt | undefined => aiPrompts.find((p) => p.id === slug);
const catLabel = (id: AiPrompt["category"]) =>
  promptCategories.find((c) => c.id === id)?.label ?? id;

const relatedFor = (prompt: AiPrompt): AiPrompt[] => {
  const sameCat = aiPrompts.filter((p) => p.category === prompt.category && p.id !== prompt.id);
  const start = sameCat.findIndex((p) => aiPrompts.indexOf(p) > aiPrompts.indexOf(prompt));
  const ordered = start === -1 ? sameCat : [...sameCat.slice(start), ...sameCat.slice(0, start)];
  const picks = ordered.slice(0, 4);
  if (picks.length < 4) {
    for (const p of aiPrompts) {
      if (picks.length >= 4) break;
      if (p.id !== prompt.id && !picks.some((x) => x.id === p.id)) picks.push(p);
    }
  }
  return picks;
};

export const Route = createFileRoute("/ai-prompts/$slug")({
  loader: ({ params }) => {
    const prompt = byId(params.slug);
    if (!prompt) throw notFound();
    return { prompt };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Prompt not found — EasyFileMagic" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.prompt;
    const title = `${p.title} — Free AI Prompt`;
    const description = `${p.description} Copy this free ${catLabel(p.category)} prompt for ChatGPT, Claude, Gemini or Midjourney — no signup.`.slice(0, 300);
    const url = abs(`/ai-prompts/${params.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 154) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 154) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: abs("/og-ai-prompts.jpg") },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:site_name", content: "EasyFileMagic" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description.slice(0, 154) },
        { name: "twitter:image", content: abs("/og-ai-prompts.jpg") },

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
              { "@type": "ListItem", position: 2, name: "AI Prompts", item: abs("/ai-prompts") },
              { "@type": "ListItem", position: 3, name: p.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: PromptPage,
  errorComponent: PromptMissing,
  notFoundComponent: PromptMissing,
});

function PromptMissing() {
  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-mono text-3xl font-bold text-ink">Prompt not found</h1>
        <p className="mt-3 text-graphite/80">Browse the full library instead.</p>
        <Link
          to="/ai-prompts"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-ink px-4 font-mono text-xs font-bold uppercase tracking-wider text-paper"
        >
          All AI prompts
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function PromptPage() {
  const { prompt } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const related = relatedFor(prompt);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main>
        <section className="border-b border-line bg-paper-2/60">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <Link
              to="/ai-prompts"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-graphite/70 hover:text-ink"
            >
              <ArrowLeft aria-hidden className="h-3.5 w-3.5" /> All AI prompts
            </Link>
            <div className="mt-4 flex items-center gap-2">
              <Sparkles aria-hidden className="h-4 w-4 text-signal" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                {catLabel(prompt.category)}
              </span>
            </div>
            <h1 className="mt-2 font-mono text-3xl font-bold text-ink sm:text-4xl">{prompt.title}</h1>
            <p className="mt-3 text-lg leading-relaxed text-graphite/90">{prompt.description}</p>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="font-mono text-xl font-semibold text-ink">The prompt</h2>
            <pre className="mt-4 whitespace-pre-wrap rounded-md border border-line bg-paper-2/60 p-4 font-mono text-[13px] leading-relaxed text-graphite">
{prompt.prompt}
            </pre>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copy}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-ink px-4 font-mono text-xs font-bold uppercase tracking-wider text-paper transition hover:brightness-110"
              >
                {copied ? (
                  <>
                    <Check aria-hidden className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy aria-hidden className="h-3.5 w-3.5" /> Copy prompt
                  </>
                )}
              </button>
              {prompt.tags?.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full border border-line bg-paper-2/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-graphite/70"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-graphite/80">
              Paste it into ChatGPT, Claude, Gemini or Midjourney and replace anything in{" "}
              <code className="rounded bg-paper-2 px-1">[SQUARE BRACKETS]</code> with your own details.
            </p>
          </div>
        </section>

        {/* Related prompts */}
        <section className="border-b border-line bg-paper-2/40">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="font-mono text-2xl font-bold text-ink">Related prompts</h2>
            <p className="mt-2 text-sm text-graphite/80">
              More {catLabel(prompt.category)} prompts from the library.
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/ai-prompts/$slug"
                    params={{ slug: r.id }}
                    className="flex h-full flex-col rounded-md border border-line bg-white p-4 transition hover:border-ink"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                      {catLabel(r.category)}
                    </span>
                    <span className="mt-1 font-mono text-base font-semibold text-ink">{r.title}</span>
                    <span className="mt-1 text-sm leading-relaxed text-graphite/80">{r.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/ai-prompts"
              className="mt-6 inline-flex h-10 items-center rounded-md border border-ink px-4 font-mono text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper"
            >
              Browse all {aiPrompts.length} AI prompts
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
