import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserInfo } from "@/lib/auth";
import { toast } from "sonner";
import GlassmorphicLoader from "@/components/common/GlassLoader";
import { lazy } from "react";

const ConfigPage = lazy(() => import("@/components/pages/ConfigPage"));
export const Route = createFileRoute("/config/")({
  beforeLoad: () => {
    if (!getUserInfo()) {
      toast.error("You have to login first in order to access this feature.");
      throw redirect({ to: "/login" });
    }
  },
  component: ConfigPage,
  pendingComponent: () => (
    <div className="w-full h-screen">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
