import { createFileRoute, redirect } from "@tanstack/react-router";

/** Marketing-friendly alias kept for inbound links; the tool itself lives at /tools/image-converter. */
export const Route = createFileRoute("/jpg-to-webp")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/$slug", params: { slug: "image-converter" }, statusCode: 301 });
  },
});
