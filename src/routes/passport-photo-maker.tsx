import { createFileRoute, redirect } from "@tanstack/react-router";

/** Marketing-friendly alias kept for inbound links; the tool itself lives at /tools/photo-id-maker. */
export const Route = createFileRoute("/passport-photo-maker")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/$slug", params: { slug: "photo-id-maker" }, statusCode: 301 });
  },
});
