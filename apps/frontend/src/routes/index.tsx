import HomePage from "@/components/pages/HomePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown> | null = null) => {
    if (!search) return {};
    return {
      oauth: search?.oauth?.toString() || undefined,
    };
  },
  component: HomePage,
});
