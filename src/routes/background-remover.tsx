import { createFileRoute, redirect } from "@tanstack/react-router";

/** Marketing-friendly alias kept for inbound links; the tool itself lives at /tools/remove-background. */
export const Route = createFileRoute("/background-remover")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/$slug", params: { slug: "remove-background" }, statusCode: 301 });
  },
});
