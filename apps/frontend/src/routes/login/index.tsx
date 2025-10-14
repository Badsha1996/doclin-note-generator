import GlassmorphicLoader from "@/components/common/GlassLoader";
import { clearUserInfo, getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import z from "zod";

const LoginPage = lazy(() => import("@/components/pages/LoginPage"));
export const Route = createFileRoute("/login/")({
  beforeLoad: () => {
    const user = getUserInfo();
    if (user && new Date(user.expiry) > new Date()) {
      throw redirect({ to: "/" });
    } else if (user) clearUserInfo();
  },
  component: LoginPage,
  pendingComponent: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
  validateSearch: z.object({
    oauth: z.string().optional(),
    redirect: z.string().optional(),
  }),
});
