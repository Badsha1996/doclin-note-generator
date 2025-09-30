import ExamPaperPage from "@/components/pages/ExamPaperPage";
import { getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { toast } from "sonner";
export const Route = createFileRoute("/examPaper/")({
  beforeLoad: () => {
    if (!getUserInfo()) {
      toast.error("You have to login first in order to access this feature.");
      throw redirect({ to: "/login" });
    }
  },
  component: ExamPaperPage,
});
