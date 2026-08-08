import { createFileRoute, redirect } from "@tanstack/react-router";
import { comparisonTargets } from "@/lib/comparisons";

/**
 * Friendly /compare/easyfilemagic-vs-<competitor> URLs permanently redirect to
 * the canonical comparison page at /vs/<competitor>, so there is only ever one
 * indexable version of each head-to-head.
 */
function resolveCompetitor(splat: string): string | undefined {
  const raw = splat.replace(/^\/+|\/+$/g, "").split("/")[0]?.toLowerCase() ?? "";
  if (!raw) return undefined;
  const key = raw
    .replace(/^easyfilemagic-vs-/, "")
    .replace(/^efm-vs-/, "")
    .replace(/^vs-/, "")
    .replace(/-alternative$/, "");
  return comparisonTargets.find((c) => c.slug === key || key.startsWith(c.slug))?.slug;
}

export const Route = createFileRoute("/compare/$")({
  beforeLoad: ({ params }) => {
    const competitor = resolveCompetitor((params as { _splat?: string })._splat ?? "");
    throw redirect({
      to: competitor ? "/vs/$competitor" : "/vs",
      params: competitor ? { competitor } : undefined,
      statusCode: 301,
    });
  },
});
