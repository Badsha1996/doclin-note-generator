import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUserInfo } from "@/lib/auth";
import ConfigPage from "@/components/pages/ConfigPage";

export const Route = createFileRoute("/config/")({
  beforeLoad: () => {
    if (!getUserInfo()) {
      throw redirect({ to: "/" });
    }
  },
  component: ConfigPage,
});


