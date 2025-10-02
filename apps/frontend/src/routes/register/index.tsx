import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserInfo } from "@/lib/auth";
import RegisterPage from "@/components/pages/RegisterPage";

export const Route = createFileRoute("/register/")({
  beforeLoad: () => {
    if (getUserInfo()) {
      throw redirect({ to: "/" });
    }
  },
  component: RegisterPage,
});
