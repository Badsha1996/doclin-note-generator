import { createFileRoute } from "@tanstack/react-router";
import GlassmorphicLoader from "@/components/common/GlassLoader";
import { lazy } from "react";

const ConfigPage = lazy(() => import("@/components/pages/ConfigPage"));
export const Route = createFileRoute("/config/")({
  component: ConfigPage,
  pendingComponent: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
