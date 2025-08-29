import { Outlet, createRootRoute, useRouter } from "@tanstack/react-router";
import BackgroundLayout from "@/layouts/BackgroundLayout";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  return (
    <BackgroundLayout>
      {!(pathname === "/login" || pathname === "/register") }
      <Outlet />
    </BackgroundLayout>
  );
}
