import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { posts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const Route = createFileRoute("/blog.rss.xml")({
  server: {
    handlers: {
      GET: () => {
        const sorted = [...posts].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        const items = sorted
          .map((p) => {
            const url = `${SITE_URL}/blog/${p.slug}`;
            const pub = new Date(p.date).toUTCString();
            return [
              `    <item>`,
              `      <title>${escapeXml(p.title)}</title>`,
              `      <link>${url}</link>`,
              `      <guid isPermaLink="true">${url}</guid>`,
              `      <pubDate>${pub}</pubDate>`,
              `      <description>${escapeXml(p.description)}</description>`,
              p.lang ? `      <language>${p.lang}</language>` : null,
              ...p.tags.map((t) => `      <category>${escapeXml(t)}</category>`),
              `    </item>`,
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `  <channel>`,
          `    <title>EasyFileMagic Blog</title>`,
          `    <link>${SITE_URL}/blog</link>`,
          `    <atom:link href="${SITE_URL}/blog.rss.xml" rel="self" type="application/rss+xml" />`,
          `    <description>Practical guides on PDFs, image conversion, OCR and other browser-based file tools.</description>`,
          `    <language>en</language>`,
          `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
          items,
          `  </channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});