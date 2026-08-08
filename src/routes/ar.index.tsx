import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/landing/HomePage";
import { homeHead } from "@/lib/i18n/home-head";

export const Route = createFileRoute("/ar/")({
  head: () => homeHead("ar"),
  component: () => <HomePage locale="ar" />,
});
