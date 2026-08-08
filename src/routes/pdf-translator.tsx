import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Legacy URL: preserve SEO from the previous /pdf-translator page by
// issuing a 301 permanent redirect to the current /tools/pdf-translator.
export const Route = createFileRoute("/pdf-translator")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(null, {
          status: 301,
          headers: {
            Location: "/tools/pdf-translator",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
