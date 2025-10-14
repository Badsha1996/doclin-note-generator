import GlassmorphicLoader from "@/components/common/GlassLoader";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";


const AboutPage = lazy(() => import("@/components/pages/AboutPage"));
export const Route = createFileRoute("/about/")({
  
  component: AboutPage,
  pendingComponent: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
