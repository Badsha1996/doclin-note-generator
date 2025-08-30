import { Outlet, createRootRoute, useRouter } from "@tanstack/react-router";
import BackgroundLayout from "@/layouts/BackgroundLayout";
import Navbar from "@/components/common/Navbar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  return (
    <div>
      {!pathname.startsWith("/login") && !pathname.startsWith("/register") && (
        <Navbar />
      )}
      <BackgroundLayout>
        <Outlet />
      </BackgroundLayout>
    </div>
  );
}
