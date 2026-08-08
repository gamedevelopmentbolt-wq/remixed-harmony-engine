import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { tools } from "@/lib/tools";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import {
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  detectPreferredLocale,
  isLocale,
  localePath,
} from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="min-h-screen bg-paper text-graphite">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">404</p>
        <h1 className="mt-3 font-mono text-5xl font-bold text-ink">Page not found</h1>
        <p className="mt-4 text-lg text-graphite/85">
          That URL doesn't map to anything on EasyFileMagic — but you're probably looking for one of these.
        </p>

        <h2 className="mt-10 font-mono text-sm font-bold uppercase tracking-widest text-ink">Popular tools</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            { slug: "merge-pdf", name: "Merge PDF" },
            { slug: "compress-pdf", name: "Compress PDF" },
            { slug: "pdf-word", name: "PDF ⇄ Word" },
            { slug: "image-converter", name: "Image Converter" },
            { slug: "compress-image", name: "Compress Image" },
            { slug: "pdf-to-jpg", name: "PDF to JPG" },
            { slug: "qr-code-generator", name: "QR Code Generator" },
            { slug: "remove-background", name: "Remove Background" },
          ].map((t) => (
            <li key={t.slug}>
              <a
                href={`/tools/${t.slug}`}
                className="block rounded-md border border-line bg-white px-4 py-2 font-mono text-sm text-ink hover:border-ink"
              >
                {t.name}
              </a>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-mono text-sm font-bold uppercase tracking-widest text-ink">Or head somewhere useful</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/" className="inline-flex h-9 items-center rounded-md bg-ink px-4 font-mono text-xs uppercase tracking-wider text-paper hover:brightness-110">
            All tools
          </Link>
          <a href="/blog" className="inline-flex h-9 items-center rounded-md border border-line bg-white px-4 font-mono text-xs uppercase tracking-wider text-ink hover:border-ink">
            Blog
          </a>
          <a href="/ai-prompts" className="inline-flex h-9 items-center rounded-md border border-line bg-white px-4 font-mono text-xs uppercase tracking-wider text-ink hover:border-ink">
            AI Prompts
          </a>
          <a href="/changelog" className="inline-flex h-9 items-center rounded-md border border-line bg-white px-4 font-mono text-xs uppercase tracking-wider text-ink hover:border-ink">
            What's new
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Sitewide fallbacks only — every content route overrides title/description
      // and supplies its own og:image in its own head().
      { title: "EasyFileMagic – Free Online PDF, Image & AI Tools (No Signup)" },
      {
        name: "description",
        content:
          "Merge, compress, convert and edit PDFs, images and files right in your browser. Free, no signup, no watermarks, no installs.",
      },
      { property: "og:site_name", content: "EasyFileMagic" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],

    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Baloo+2:wght@600;700;800&family=Pacifico&display=swap",
      },
    ],
    scripts: [
      // Google tag (gtag.js) — GA4 + Google Ads
      { src: "https://www.googletagmanager.com/gtag/js?id=G-8XCEMECE5M", async: true },
      {
        children: [
          "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());",
          // Lovable's preview iframe loads the app with ?forceHideBadge=true.
          // That is not a real visitor, so disable GA entirely for those loads.
          "var efmU=new URL(window.location.href);var efmBadge=efmU.searchParams.has('forceHideBadge');",
          "if(efmBadge){window['ga-disable-G-8XCEMECE5M']=true;}",
          // Strip badge/preview params from the reported page_location so they
          // never pollute page path reports.
          "['forceHideBadge','forceHideBadge=true'].forEach(function(p){efmU.searchParams.delete(p);});",
          "var efmLoc=efmU.origin+efmU.pathname+(efmU.searchParams.toString()?'?'+efmU.searchParams.toString():'');",
          "gtag('config', 'G-8XCEMECE5M', { send_page_view: !efmBadge, page_location: efmLoc, page_path: efmU.pathname });",
          "gtag('config', 'AW-11476747517');",
        ].join(""),
      },

      // Google Publisher Tag
      { src: "https://securepubads.g.doubleclick.net/tag/js/gpt.js", async: true },
      { children: "window.googletag = window.googletag || {cmd: []};" },
      // Google AdSense
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6596342140723226",
        async: true,
        crossOrigin: "anonymous",
      },
      // Ahrefs Analytics
      {
        src: "https://analytics.ahrefs.com/analytics.js",
        "data-key": "mPQxme0uaWnC2u7kcQ0uVg",
        async: true,
      } as any,
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const sync = () => {
      const root = document.documentElement;
      const fromPath = window.location.pathname.match(/^\/(fr|es|ar)(?=\/|$)/)?.[1];
      const fromQuery = new URLSearchParams(window.location.search).get("lang");
      const raw = fromPath ?? fromQuery ?? "en";
      const lang = isLocale(raw) ? raw : "en";
      root.setAttribute("lang", LOCALE_META[lang].tag);
      root.setAttribute("dir", LOCALE_META[lang].dir);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  // First visit on the English home page: send the user to their own language.
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    if (stored) return;
    const detected = detectPreferredLocale();
    if (detected !== "en") window.location.replace(localePath(detected, "/"));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
