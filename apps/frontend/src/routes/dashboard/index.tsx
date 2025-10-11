import { createFileRoute, redirect } from "@tanstack/react-router";
import { clearUserInfo, getUserInfo } from "@/lib/auth";
import DashboardPage from "@/components/pages/DashboardPage";
import { toast } from "sonner";
export const Route = createFileRoute("/dashboard/")({
  beforeLoad: () => {
    const user = getUserInfo();
    let shouldRedirect = false;
    let redirectTo = "/login";

    if (!user) {
      shouldRedirect = true;
    } else if (new Date(user.expiry) < new Date()) {
      clearUserInfo();
      shouldRedirect = true;
    } else if (user.role === "user") {
      shouldRedirect = true;
      redirectTo = "/";
    }
    if (shouldRedirect) {
      toast.error("This feature is only available for admin users.");
      throw redirect({ to: redirectTo });
    }
  },
  component: DashboardPage,
});
