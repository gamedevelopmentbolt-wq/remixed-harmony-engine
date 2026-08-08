// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://easyfilemagic.com";

function extractSlugs(filePath: string): string[] {
  const src = readFileSync(filePath, "utf8");
  const slugs: string[] = [];
  const re = /slug:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) slugs.push(m[1]);
  return slugs;
}

function extractPromptIds(filePath: string): string[] {
  const src = readFileSync(filePath, "utf8");
  const start = src.indexOf("export const aiPrompts");
  if (start === -1) return [];
  const ids: string[] = [];
  const re = /\bid:\s*"([^"]+)"/g;
  re.lastIndex = start;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) ids.push(m[1]);
  return ids;
}

const LOCALE_PREFIXES = ["/fr", "/es", "/ar"];

function generateSitemapXml(rootDir: string): string {
  const toolSlugs = extractSlugs(resolve(rootDir, "src/lib/tools.ts"));
  const blogSlugs = extractSlugs(resolve(rootDir, "src/lib/blog.ts"));
  const promptIds = extractPromptIds(resolve(rootDir, "src/lib/ai-prompts.ts"));
  const vsSlugs = extractSlugs(resolve(rootDir, "src/lib/comparisons.ts"));
  const entries: { path: string; changefreq: string; priority: string }[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/about", changefreq: "yearly", priority: "0.6" },
    { path: "/blog", changefreq: "weekly", priority: "0.7" },
    { path: "/ai-prompts", changefreq: "weekly", priority: "0.7" },
    { path: "/vs", changefreq: "monthly", priority: "0.6" },
    { path: "/changelog", changefreq: "weekly", priority: "0.4" },
    { path: "/privacy", changefreq: "yearly", priority: "0.4" },
    { path: "/terms", changefreq: "yearly", priority: "0.4" },
    { path: "/contact", changefreq: "yearly", priority: "0.4" },
    // NOTE: /pdf-translator, /background-remover and /passport-photo-maker are
    // 301 redirects — deliberately excluded so the sitemap only lists 200s.
    ...LOCALE_PREFIXES.map((p) => ({ path: p, changefreq: "weekly", priority: "0.7" })),
    ...toolSlugs.map((s) => ({ path: `/tools/${s}`, changefreq: "monthly", priority: "0.8" })),
    ...LOCALE_PREFIXES.flatMap((p) =>
      toolSlugs.map((s) => ({ path: `${p}/tools/${s}`, changefreq: "monthly", priority: "0.5" })),
    ),
    ...blogSlugs.map((s) => ({ path: `/blog/${s}`, changefreq: "monthly", priority: "0.6" })),
    ...promptIds.map((s) => ({ path: `/ai-prompts/${s}`, changefreq: "monthly", priority: "0.5" })),
    ...vsSlugs.map((s) => ({ path: `/vs/${s}`, changefreq: "monthly", priority: "0.5" })),
  ];


  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${SITE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");
  // IMPORTANT: no leading whitespace/BOM — first byte must be '<'.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function sitemapPlugin() {
  const rootDir = dirname(fileURLToPath(import.meta.url));
  const write = (outDir: string) => {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "sitemap.xml"), generateSitemapXml(rootDir), { encoding: "utf8" });
  };
  return {
    name: "efm-static-sitemap",
    buildStart() {
      // Write into /public so it's copied to the build output and served as a static file
      // (identical to robots.txt), bypassing the dynamic SSR route on custom domains.
      try {
        write(resolve(rootDir, "public"));
      } catch (err) {
        console.warn(`[sitemap] generation failed: ${(err as Error).message}`);
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [sitemapPlugin()],
  },
});
