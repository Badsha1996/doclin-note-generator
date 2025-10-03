import GlassmorphicLoader from "@/components/common/GlassLoader";
import { getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";

const LoginPage = lazy(() => import("@/components/pages/LoginPage"));
export const Route = createFileRoute("/login/")({
  beforeLoad: () => {
    if (getUserInfo()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
  pendingComponent: () => (
    <GlassmorphicLoader message="Loading Login..." />
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
