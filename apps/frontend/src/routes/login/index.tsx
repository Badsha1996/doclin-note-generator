import GlassmorphicLoader from "@/components/common/GlassLoader";
import { getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import z from "zod";

const LoginPage = lazy(() => import("@/components/pages/LoginPage"));
export const Route = createFileRoute("/login/")({
  beforeLoad: () => {
    if (getUserInfo()) {
      throw redirect({ to: "/" });
    }
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
