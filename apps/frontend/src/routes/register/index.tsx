import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import GlassmorphicLoader from "@/components/common/GlassLoader";
import { clearUserInfo, getUserInfo } from "@/lib/auth";

const RegisterPage = lazy(() => import("@/components/pages/RegisterPage"));
export const Route = createFileRoute("/register/")({
  beforeLoad: () => {
    const user = getUserInfo();
    if (user && new Date(user.expiry) > new Date()) {
      throw redirect({ to: "/" });
    } else if (user) clearUserInfo();
  },
  component: RegisterPage,
  pendingComponent: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
