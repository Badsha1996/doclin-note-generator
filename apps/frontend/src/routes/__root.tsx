import * as React from "react";
import { Outlet, createRootRoute, useRouter } from "@tanstack/react-router";
import Navbar from "@/components/common/Navbar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  return (
    <React.Fragment>
      {!pathname.startsWith("/login") && !pathname.startsWith("/register") && <Navbar />}
      <Outlet />
    </React.Fragment>
  );
}
