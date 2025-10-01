import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUserInfo } from "@/lib/auth";
import ConfigPage from "@/components/pages/ConfigPage";
import { toast } from "sonner";
export const Route = createFileRoute("/config/")({
  beforeLoad: () => {
    if (!getUserInfo()) {
      toast.error("You have to login first in order to access this feature.");
      throw redirect({ to: "/login" });
    }
  },
  component: ConfigPage,
});
