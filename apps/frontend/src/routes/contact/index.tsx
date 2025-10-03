import GlassmorphicLoader from "@/components/common/GlassLoader";
import { getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import { toast } from "sonner";

const ContactPage = lazy(() => import("@/components/pages/ContactPage"));
export const Route = createFileRoute("/contact/")({
  beforeLoad: () => {
    if (!getUserInfo()) {
      toast.error("You have to login first in order to access this feature.");
      throw redirect({ to: "/login" });
    }
  },
  component: ContactPage,
  pendingComponent: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
