import { Outlet, createRootRoute, useMatches } from "@tanstack/react-router";
import BackgroundLayout from "@/layouts/BackgroundLayout";
import Navbar from "@/components/common/Navbar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const matches = useMatches();

  const isAuthRoute = matches.some(
    (m) => m.routeId === "/login/" || m.routeId === "/register/"
  );

  return (
    <div>
      {!isAuthRoute && <Navbar />}
      <BackgroundLayout>
        <Outlet />
      </BackgroundLayout>
    </div>
  );
}
