import GlassmorphicLoader from "@/components/common/GlassLoader";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import z from "zod";

const ContactPage = lazy(() => import("@/components/pages/ContactPage"));
export const Route = createFileRoute("/contact/")({
  component: ContactPage,
  pendingComponent: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  validateSearch: z.object({
    tab: z.string().optional(),
  }),
  pendingMs: 500,
  pendingMinMs: 200,
});
