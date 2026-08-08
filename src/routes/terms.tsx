import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { abs, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => {
    const title = "Terms of Service — EasyFileMagic";
    const description =
      "The basic terms for using EasyFileMagic's free browser-based file tools: provided as-is, acceptable use, and limitation of liability.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: abs("/terms") },
        ...ogImageMeta(),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: abs("/terms") }],
    };
  },
  component: TermsPage,
});

function TermsPage() {
  const updated = "July 18, 2026";
  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Legal</p>
        <h1 className="mt-2 font-mono text-3xl font-bold text-ink sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-graphite/60">
          Last updated: {updated}
        </p>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">1. Acceptance</h2>
          <p>
            By using EasyFileMagic (&quot;the site&quot;) you agree to these terms. If you do
            not agree, please don&apos;t use the site.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">2. Free to use</h2>
          <p>
            All tools on EasyFileMagic are free to use for personal and commercial purposes.
            There is no signup, no watermark, and no per-file or per-day usage limit beyond
            what your own browser and device can handle.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">3. Provided &quot;as-is&quot;, no warranty</h2>
          <p>
            The site and its tools are provided &quot;as is&quot; and &quot;as available&quot;
            without warranties of any kind, express or implied. We do not warrant that the tools
            will always be available, error-free, or that the output will meet your specific
            requirements. Always keep a copy of your original file before processing it.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">4. Your responsibility for content</h2>
          <p>
            Because the tools run entirely in your browser, we do not see or store your files.
            You are solely responsible for the content you process and for how you use the
            resulting output files — including compliance with copyright, licensing, and any
            applicable laws.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">5. Acceptable use</h2>
          <p>You agree not to use EasyFileMagic:</p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>To process, generate, or distribute illegal content, including CSAM, or content that infringes third-party rights.</li>
            <li>To attempt to attack, overload, reverse-engineer, or otherwise interfere with the site or its infrastructure.</li>
            <li>To scrape, embed, or resell the tools as your own service.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">6. Third-party services</h2>
          <p>
            The site loads standard third-party scripts (analytics, advertising) and, for some
            tools, downloads processing libraries from public CDNs. Your use of those services
            is subject to their own terms.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">7. Limitation of liability</h2>
          <p>
            To the fullest extent allowed by law, EasyFileMagic and its operators are not liable
            for any indirect, incidental, consequential, or special damages arising out of your
            use of the site, including data loss, corrupted output files, or business
            interruption. Our total liability, if any, is limited to the amount you paid to use
            the site — which is zero.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">8. Changes</h2>
          <p>
            We may update these terms at any time. Material changes will be reflected on this
            page with an updated date at the top.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">9. Contact</h2>
          <p>
            Questions? Email{" "}
            <a
              className="text-ink underline underline-offset-2 hover:text-signal"
              href="mailto:info@easyfilemagic.com"
            >
              info@easyfilemagic.com
            </a>
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