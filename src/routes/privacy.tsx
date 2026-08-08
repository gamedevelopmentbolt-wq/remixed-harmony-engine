import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { abs, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const title = "Privacy Policy — EasyFileMagic";
    const description =
      "How EasyFileMagic handles your files (processed locally in your browser) and what site-level analytics and advertising cookies are used.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: abs("/privacy") },
        ...ogImageMeta(),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: abs("/privacy") }],
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const updated = "July 18, 2026";
  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Legal</p>
        <h1 className="mt-2 font-mono text-3xl font-bold text-ink sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-graphite/60">
          Last updated: {updated}
        </p>

        <p className="mt-8 rounded-lg border-l-4 border-signal bg-white/70 p-4 text-base text-ink">
          <strong className="font-mono text-[11px] uppercase tracking-widest text-signal">The short version</strong>
          <br />
          Your files are processed entirely inside your web browser and are never uploaded to
          EasyFileMagic servers. The site itself does use standard third-party analytics and
          advertising scripts, which collect some anonymous usage data. Those are two different
          things — this page explains both honestly.
        </p>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">1. Your files stay on your device</h2>
          <p>
            Every tool on EasyFileMagic runs as a static web page. When you drop a PDF, image,
            video, or any other file into a tool, the file is opened, read, and processed by
            JavaScript, WebAssembly, and the browser&apos;s Canvas / File APIs running on your
            own computer or phone. We do not upload your files to any server, and we do not have
            any storage bucket, database, or backend that receives them.
          </p>
          <p>
            A few of the heavier tools (for example OCR, background removal, and audio/video
            conversion) need a one-time download of a processing engine — a Tesseract language
            model, a background-removal neural network, or the ffmpeg.wasm binary — from a public
            CDN. That network request only downloads the library to your browser; your actual
            files are still processed locally and are not part of that request.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">2. Site analytics and advertising</h2>
          <p>
            To keep the site free we run standard third-party scripts that do collect some data
            about visits (but not about your file contents). These include:
          </p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              <strong>Google Analytics 4 (GA4)</strong> and <strong>Google Ads (gtag.js)</strong>
              &nbsp;— page views, referrer, approximate location, device / browser, and
              conversion signals.
            </li>
            <li>
              <strong>Google AdSense</strong> and <strong>Google Publisher Tag</strong> — serve
              the ads you see on some pages and may personalize them.
            </li>
            <li>
              <strong>Ahrefs Analytics</strong> — lightweight visit analytics used for SEO
              reporting.
            </li>
          </ul>
          <p>
            These services may set cookies or use similar identifiers, and may collect data such
            as your IP address, user agent, pages viewed, and interactions with ads. That data is
            processed by those third parties under their own privacy policies. You can control
            ad personalization at{" "}
            <a
              className="text-ink underline underline-offset-2 hover:text-signal"
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noreferrer"
            >
              Google Ad Settings
            </a>
            , and you can install a browser extension or use browser tracking-protection to
            block these scripts entirely if you prefer.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">3. What we do <em>not</em> do</h2>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>We do not require you to sign up or create an account.</li>
            <li>We do not ask for your email address to use a tool.</li>
            <li>We do not upload, store, or log the files you process.</li>
            <li>We do not sell any personal data.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">4. Local storage</h2>
          <p>
            Some tools may store small non-sensitive preferences (for example, your last-used
            quality slider) in your browser&apos;s <code>localStorage</code>. This never leaves
            your device. Clearing your browser storage removes it.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">5. Children</h2>
          <p>
            EasyFileMagic is a general-purpose utility site and is not directed at children
            under 13. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">6. Changes to this policy</h2>
          <p>
            If we materially change how the site handles data, we&apos;ll update this page and
            revise the &quot;last updated&quot; date at the top.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">7. Contact</h2>
          <p>
            Questions about privacy? Email{" "}
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