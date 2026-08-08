import { createFileRoute, redirect } from "@tanstack/react-router";
import { TOOLS } from "@/lib/tools";

/**
 * Legacy /free-tools/* URLs permanently redirect to their canonical
 * /tools/<slug> page so external links and old indexed URLs never 404.
 */
const LEGACY_MAP: Record<string, string> = {
  "how-to-generate-qr-code-free": "qr-code-generator",
  "qr-code": "qr-code-generator",
  "qr-code-generator-free": "qr-code-generator",
};

function resolveToolSlug(rest: string): string | undefined {
  const raw = rest.replace(/^\/+|\/+$/g, "").split("/")[0]?.toLowerCase() ?? "";
  if (!raw) return undefined;
  if (LEGACY_MAP[raw]) return LEGACY_MAP[raw];

  const slugs = new Set(TOOLS.map((t) => t.slug));
  if (slugs.has(raw)) return raw;

  // Strip common marketing affixes: "how-to-…-free", "best-…-online"
  const stripped = raw
    .replace(/^(how-to-|best-|free-)/, "")
    .replace(/-(free|online|tool|guide)$/, "");
  if (slugs.has(stripped)) return stripped;

  return TOOLS.find((t) => stripped.includes(t.slug) || t.slug.includes(stripped))?.slug;
}

export const Route = createFileRoute("/free-tools/$")({
  beforeLoad: ({ params }) => {
    const target = resolveToolSlug((params as { _splat?: string })._splat ?? "");
    throw redirect({
      to: target ? "/tools/$slug" : "/",
      params: target ? { slug: target } : undefined,
      statusCode: 301,
    });
  },
});
