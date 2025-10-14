import { createFileRoute, redirect } from "@tanstack/react-router";
import { clearUserInfo, getUserInfo } from "@/lib/auth";
import { toast } from "sonner";
import GlassmorphicLoader from "@/components/common/GlassLoader";
import { lazy } from "react";

const ConfigPage = lazy(() => import("@/components/pages/ConfigPage"));
export const Route = createFileRoute("/config/")({
  beforeLoad: () => {
    const user = getUserInfo();
    let shouldRedirect = false;

    if (!user) {
      shouldRedirect = true;
    } else if (new Date(user.expiry) < new Date()) {
      clearUserInfo();
      shouldRedirect = true;
    }
    if (shouldRedirect) {
      toast.error("You have to login first in order to access this feature.");
      throw redirect({ to: "/login" });
    }
  },
  component: ConfigPage,
  pendingComponent: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
