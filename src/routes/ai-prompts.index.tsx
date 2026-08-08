import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Search, Sparkles } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { aiPrompts, promptCategories, type PromptCategory } from "@/lib/ai-prompts";
import { abs } from "@/lib/site";

const FAQ = [
  {
    q: "Are these AI prompts really free to use?",
    a: "Yes. Every prompt on this page is free to copy and paste into ChatGPT, Claude, Gemini, Midjourney, DALL·E or any other AI tool. No signup, no watermark, no daily limit.",
  },
  {
    q: "Which AI models do these prompts work with?",
    a: "The ChatGPT, writing, coding and marketing prompts work with any modern chat model — ChatGPT (GPT-4o, GPT-5), Claude, Gemini, Llama and open-source models. Image prompts are tuned for Midjourney v6, DALL·E 3, SDXL and Flux.",
  },
  {
    q: "How do I use a prompt?",
    a: "Click the Copy button, paste it into your AI tool, and replace anything in [SQUARE BRACKETS] with your own details. Most prompts run in one shot; some ask you clarifying questions first.",
  },
  {
    q: "Do you add new prompts?",
    a: "Yes. This page is updated regularly with new trending prompts across ChatGPT, image generation, writing, coding and marketing categories.",
  },
  {
    q: "Can I edit or remix these prompts?",
    a: "Absolutely. Treat every prompt as a starting template — tweak the tone, constraints and examples to fit your use case.",
  },
];

export const Route = createFileRoute("/ai-prompts/")({
  head: () => ({
    meta: [
      { title: "AI Prompts — 40+ Free ChatGPT, Midjourney & DALL·E Prompts" },
      {
        name: "description",
        content:
          "Copy 40+ trending AI prompts for ChatGPT, Midjourney, DALL·E and Claude. Productivity, writing, coding, marketing and image-generation prompts — free, no signup.",
      },
      { property: "og:title", content: "Free AI Prompts Library — ChatGPT, Midjourney & More" },
      {
        property: "og:description",
        content:
          "A curated, categorized library of trending AI prompts. One-click copy, no signup, updated regularly.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: abs("/ai-prompts") },
      { property: "og:image", content: abs("/og-ai-prompts.jpg") },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free AI prompts for ChatGPT, Claude, Midjourney and DALL-E" },
      { property: "og:site_name", content: "EasyFileMagic" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free AI Prompts Library — ChatGPT, Midjourney & More" },
      {
        name: "twitter:description",
        content:
          "Copy 40+ trending AI prompts for ChatGPT, Midjourney and DALL·E. No signup, no watermark.",
      },
      { name: "twitter:image", content: abs("/og-ai-prompts.jpg") },
    ],
    links: [{ rel: "canonical", href: abs("/ai-prompts") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AI Prompts Library",
          url: abs("/ai-prompts"),
          description:
            "Categorized library of free, copy-paste AI prompts for ChatGPT, Midjourney, DALL·E and other AI tools.",
          isPartOf: { "@type": "WebSite", name: "EasyFileMagic", url: abs("/") },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
            { "@type": "ListItem", position: 2, name: "AI Prompts", item: abs("/ai-prompts") },
          ],
        }),
      },
    ],
  }),
  component: AiPromptsPage,
});

type Filter = "all" | PromptCategory;

function AiPromptsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return aiPrompts.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
    } catch {
      /* ignore */
    }
  };

  const catLabel = (id: PromptCategory) => promptCategories.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-line bg-paper-2/60">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Section · AI Prompts</p>
            <h1 className="mt-3 font-mono text-4xl font-bold text-ink sm:text-5xl">
              Free AI prompts library
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-graphite/90">
              {aiPrompts.length}+ trending, ready-to-copy prompts for ChatGPT, Claude, Midjourney, DALL·E and more.
              One-click copy. No signup, no watermark, no daily limit — same rules as every EasyFileMagic tool.
            </p>

            {/* Direct-answer summary for AI engines */}
            <div className="mt-6 rounded-md border border-line bg-white p-4 text-sm leading-relaxed text-graphite">
              <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Quick answer</p>
              <p className="mt-1">
                To use an AI prompt: click <strong>Copy</strong> on any card below, paste it into ChatGPT (or your
                AI tool of choice), and replace anything in <code className="rounded bg-paper-2 px-1">[SQUARE BRACKETS]</code>{" "}
                with your own details. All {aiPrompts.length} prompts on this page work with GPT-4o, GPT-5, Claude,
                Gemini and open-source models; image prompts are tuned for Midjourney v6, DALL·E 3, SDXL and Flux.
              </p>
            </div>

            {/* Search + filter */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Search prompts</span>
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${aiPrompts.length} prompts by keyword…`}
                  className="h-11 w-full rounded-md border border-line bg-white pl-9 pr-3 font-sans text-sm text-graphite placeholder:text-graphite/40 focus:border-ink focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Category</span>
              {(["all", ...promptCategories.map((c) => c.id)] as Filter[]).map((id) => {
                const label = id === "all" ? "All" : catLabel(id as PromptCategory);
                const active = filter === id;
                const count =
                  id === "all" ? aiPrompts.length : aiPrompts.filter((p) => p.category === id).length;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={
                      active
                        ? "inline-flex h-8 items-center gap-1.5 rounded-full border border-ink bg-ink px-3 font-mono text-[11px] uppercase tracking-widest text-paper"
                        : "inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 font-mono text-[11px] uppercase tracking-widest text-graphite/80 hover:border-ink"
                    }
                  >
                    {label}
                    <span className={active ? "text-paper/70" : "text-graphite/50"}>· {count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Prompt grid */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            {visible.length === 0 ? (
              <p className="text-center text-sm text-graphite/70">No prompts match that search.</p>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2">
                {visible.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col rounded-md border border-line bg-white p-5 shadow-sm transition hover:border-ink"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles aria-hidden className="h-4 w-4 text-signal" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                        {catLabel(p.category)}
                      </span>
                    </div>
                    <h2 className="mt-2 font-mono text-lg font-semibold text-ink">
                      <Link
                        to="/ai-prompts/$slug"
                        params={{ slug: p.id }}
                        className="hover:text-signal hover:underline"
                      >
                        {p.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-graphite/90">{p.description}</p>


                    <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-paper-2/60 p-3 font-mono text-[12.5px] leading-relaxed text-graphite">
{p.prompt}
                    </pre>

                    <div className="mt-4 flex items-center justify-between">
                      {p.tags && p.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-line bg-paper-2/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-graphite/70"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={() => copy(p.id, p.prompt)}
                        aria-label={`Copy prompt: ${p.title}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-3 font-mono text-xs font-bold uppercase tracking-wider text-paper transition hover:brightness-110"
                      >
                        {copiedId === p.id ? (
                          <>
                            <Check aria-hidden className="h-3.5 w-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy aria-hidden className="h-3.5 w-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Full index, grouped by category */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-mono text-3xl font-bold text-ink">Every prompt, by category</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-graphite/80">
              Each prompt has its own page with copy button, usage notes and related prompts.
            </p>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {promptCategories.map((c) => {
                const items = aiPrompts.filter((p) => p.category === c.id);
                if (items.length === 0) return null;
                return (
                  <div key={c.id}>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-ink">
                      {c.label}
                    </h3>
                    <p className="mt-1 text-xs text-graphite/70">{c.blurb}</p>
                    <ul className="mt-3 space-y-1.5">
                      {items.map((p) => (
                        <li key={p.id}>
                          <Link
                            to="/ai-prompts/$slug"
                            params={{ slug: p.id }}
                            className="text-sm text-graphite/90 underline-offset-2 hover:text-ink hover:underline"
                          >
                            {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}

        <section className="border-b border-line bg-paper-2/40">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">FAQ</p>
            <h2 className="mt-3 font-mono text-3xl font-bold text-ink">AI prompts, answered</h2>
            <dl className="mt-6 space-y-5">
              {FAQ.map((f) => (
                <div key={f.q} className="rounded-md border border-line bg-white p-5">
                  <dt className="font-mono text-base font-semibold text-ink">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-graphite/90">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}