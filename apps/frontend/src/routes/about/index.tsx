import AboutPage from "@/components/pages/AboutPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about/")({
  component: AboutPage,
});

