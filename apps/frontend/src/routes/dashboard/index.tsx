import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserInfo } from "@/lib/auth";
import DashboardPage from "@/components/pages/DashboardPage";
import { toast } from "sonner";
export const Route = createFileRoute("/dashboard/")({
  beforeLoad: () => {
    const user = getUserInfo();
    if (!user || user?.role === "user") {
      toast.error("This feature is only available for admin users.");
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardPage,
});
