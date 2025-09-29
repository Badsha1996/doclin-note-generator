
import { createFileRoute } from "@tanstack/react-router"
import { getUserInfo } from "@/lib/auth";
export const Route = createFileRoute("/dashboard/")({
  beforeLoad: () => {
    const user = getUserInfo();
    if (!user || user?.role === "user") {
      throw redirect({ to: "/" });
    }
  },
  component: Dashboard,
});


