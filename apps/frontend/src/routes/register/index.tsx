import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import GlassmorphicLoader from "@/components/common/GlassLoader";

const RegisterPage = lazy(() => import("@/components/pages/RegisterPage"));
export const Route = createFileRoute("/register/")({
  component: RegisterPage,
  pendingComponent: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
