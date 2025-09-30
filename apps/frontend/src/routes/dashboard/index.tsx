import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserInfo } from "@/lib/auth";
import DashboardPage from "@/components/pages/DashboardPage";
export const Route = createFileRoute("/dashboard/")({
  beforeLoad: () => {
    const user = getUserInfo();
    if (!user || user?.role === "user") {
      throw redirect({ to: "/" });
    }
  },
  component: DashboardPage,
});
