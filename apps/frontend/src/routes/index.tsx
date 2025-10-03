import GlassmorphicLoader from "@/components/common/GlassLoader";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const HomePage = lazy(() => import("@/components/pages/HomePage"));

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown> | null = null) => {
    if (!search) return {};
    return {
      oauth: search?.oauth?.toString() || undefined,
    };
  },
  component: HomePage,
  pendingComponent: () => (
    <div className="w-full h-screen">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
