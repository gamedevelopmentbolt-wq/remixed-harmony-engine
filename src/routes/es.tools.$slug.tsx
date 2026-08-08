import { createFileRoute } from "@tanstack/react-router";
import { LocalizedToolPage } from "@/lib/tool-registry";
import { toolHead } from "@/lib/i18n/tool-head";

export const Route = createFileRoute("/es/tools/$slug")({
  head: ({ params }) => toolHead("es", params.slug),
  component: ToolPage,
});

function ToolPage() {
  const { slug } = Route.useParams();
  return <LocalizedToolPage locale="es" slug={slug} />;
}
