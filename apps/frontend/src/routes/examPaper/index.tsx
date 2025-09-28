import ExamPaperPage from "@/components/pages/ExamPaperPage";
import { getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";


export const Route = createFileRoute("/examPaper/")({
  beforeLoad: () => {
    if (!getUserInfo()) {
      throw redirect({ to: "/" });
    }
  },
  component: ExamPaperPage,
});


