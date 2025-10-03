import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserInfo } from "@/lib/auth";
import { lazy } from "react";
import GlassmorphicLoader from "@/components/common/GlassLoader";

const RegisterPage = lazy(() => import("@/components/pages/RegisterPage"));
export const Route = createFileRoute("/register/")({
  beforeLoad: () => {
    if (getUserInfo()) {
      throw redirect({ to: "/" });
    }
  },
  component: RegisterPage,
  pendingComponent: () => (
    <div className="w-full h-screen">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
