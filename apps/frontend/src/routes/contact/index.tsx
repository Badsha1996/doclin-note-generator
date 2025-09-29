import ContactPage from "@/components/pages/ContactPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact/")({
  component: ContactPage,
});
