import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/landing/HomePage";
import { homeHead } from "@/lib/i18n/home-head";

export const Route = createFileRoute("/fr/")({
  head: () => homeHead("fr"),
  component: () => <HomePage locale="fr" />,
});
