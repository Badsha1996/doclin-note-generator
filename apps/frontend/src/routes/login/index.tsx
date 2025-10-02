import LoginPage from "@/components/pages/LoginPage";
import { getUserInfo } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login/")({
  beforeLoad: () => {
    if (getUserInfo()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});
