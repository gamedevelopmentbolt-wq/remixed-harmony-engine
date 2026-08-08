import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { tools } from "@/lib/tools";
import { abs, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => {
    const title = "About EasyFileMagic — Free browser-based file tools, no signup";
    const description =
      `EasyFileMagic is a collection of ${tools.length} free file utilities (PDF, image, OCR, media, data) that run entirely inside your web browser. No account, no upload, no watermarks.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: abs("/about") },
        ...ogImageMeta(),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: abs("/about") }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About EasyFileMagic",
            description,
            url: abs("/about"),
          }),
        },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-graphite">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">About</p>
        <h1 className="mt-2 font-mono text-3xl font-bold text-ink sm:text-4xl">
          What EasyFileMagic is
        </h1>

        <p className="mt-6 rounded-lg border-l-4 border-signal bg-white/70 p-4 text-base text-ink">
          <strong className="font-mono text-[11px] uppercase tracking-widest text-signal">In short</strong>
          <br />
          EasyFileMagic is a free, no-signup collection of {tools.length} file utilities — merge and
          compress PDFs, convert images, run OCR, remove backgrounds, sign documents, and more —
          that run entirely inside your web browser. Your files never leave your device.
        </p>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">How it works</h2>
          <p>
            Every tool on this site is a static web page. When you drop a file into a tool, all
            processing happens locally in your browser using JavaScript, WebAssembly, and the
            Canvas API. Nothing is uploaded to a server, nothing is stored, and nothing is logged.
          </p>
          <p>
            Some heavier tools (OCR, background removal, audio/video conversion) download a
            one-time model or engine — for example the Tesseract OCR model, the background
            removal neural network, or the ffmpeg.wasm binary — from a public CDN. After that
            download, all work still runs on your own machine.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">Why it&apos;s free</h2>
          <p>
            Because the work runs on your device, we do not pay for CPU, storage, or bandwidth
            per conversion. The site is supported by unobtrusive advertising, which lets us keep
            every tool free, unwatermarked, and free of page or file-size limits.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">Privacy</h2>
          <p>
            No sign-up, no email, no account. Files are read from your device, processed in
            memory, and offered back as a download. Once you close or reload the tab, nothing
            about your file remains.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-graphite/90">
          <h2 className="font-mono text-xl font-bold text-ink">Who it&apos;s for</h2>
          <p>
            Anyone — worldwide — who needs to quickly fix a file without installing software or
            handing a document to an unknown server. The site is English-language today, but the
            tools themselves are global: PDFs, images, audio, and video from any country work
            the same way.
          </p>
        </section>

        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-md border border-ink px-5 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
          >
            ← Browse all tools
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
