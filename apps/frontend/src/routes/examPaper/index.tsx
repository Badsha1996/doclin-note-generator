import GlassmorphicLoader from "@/components/common/GlassLoader";
import { getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import { toast } from "sonner";
import z from "zod";

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
    <div className="w-full h-screen flex items-center justify-center">
      <GlassmorphicLoader message="Loading..." />
    </div>
  ),
  pendingMs: 500,
  pendingMinMs: 200,
  validateSearch: z.object({
    subject: z.string(),
    board: z.string().optional(),
    paper: z.string().optional(),
    code: z.string().optional(),
    year: z.number(),
    prev: z.boolean(),
    oauth: z.string().optional(),
  }),
});
