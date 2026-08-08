import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { abs, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => {
    const title = "Contact — EasyFileMagic";
    const description =
      "Get in touch with EasyFileMagic. Email info@easyfilemagic.com for questions, feedback, bug reports, or partnership inquiries.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: abs("/contact") },
        ...ogImageMeta(),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: abs("/contact") }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact EasyFileMagic",
            url: abs("/contact"),
            email: "info@easyfilemagic.com",
          }),
        },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Contact</p>
        <h1 className="mt-2 font-mono text-3xl font-bold text-ink sm:text-4xl">Get in touch</h1>

        <p className="mt-6 text-lg leading-relaxed text-graphite/90">
          Bug report, feature request, broken tool, DMCA notice, or just want to say hi — the
          fastest way to reach us is by email.
        </p>

        <div className="mt-8 rounded-2xl border border-line bg-white p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">Email</p>
          <a
            href="mailto:info@easyfilemagic.com"
            className="mt-2 inline-flex items-center gap-2 font-mono text-2xl font-bold text-ink hover:text-signal"
          >
            <Mail className="h-5 w-5" aria-hidden />
            info@easyfilemagic.com
          </a>
          <p className="mt-4 text-sm text-graphite/70">
            We&apos;re a small team — we usually reply within 2&ndash;3 business days. When
            reporting a broken tool, please include the tool name, your browser, and (if
            possible) the file type / size that caused the issue.
          </p>
        </div>

        <section className="mt-10 space-y-3 text-graphite/90">
          <h2 className="font-mono text-lg font-bold text-ink">Before you email</h2>
          <p>
            If you have a question about how the site handles files or data, the{" "}
            <Link to="/privacy" className="text-ink underline underline-offset-2 hover:text-signal">
              Privacy Policy
            </Link>{" "}
            probably answers it. For terms of use, see the{" "}
            <Link to="/terms" className="text-ink underline underline-offset-2 hover:text-signal">
              Terms of Service
            </Link>
            .
          </p>
        </section>

        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-md border border-ink px-5 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
          >
            ← Back to all tools
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}