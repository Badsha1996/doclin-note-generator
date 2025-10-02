import GlassmorphicLoader from "@/components/common/GlassLoader";
import { getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import { toast } from "sonner";

const ExamPaper = lazy(() => import("@/components/pages/ExamPaperPage"));
export const Route = createFileRoute("/examPaper/")({
  beforeLoad: () => {
    if (!getUserInfo()) {
      toast.error("You have to login first in order to access this feature.");
      throw redirect({ to: "/login" });
    }
  },
  component: ExamPaper,
  pendingComponent: () => (
    <GlassmorphicLoader message="Loading exam paper..." />
  ),
  pendingMs: 500,
  pendingMinMs: 200,
});
