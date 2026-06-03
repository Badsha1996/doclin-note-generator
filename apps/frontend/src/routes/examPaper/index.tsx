import GlassmorphicLoader from "@/components/common/GlassLoader";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import z from "zod";

const ExamPaper = lazy(() => import("@/components/pages/ExamPaperPage"));
export const Route = createFileRoute("/examPaper/")({
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
