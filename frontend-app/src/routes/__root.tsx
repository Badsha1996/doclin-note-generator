import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import Navbar from "@/components/common/Navbar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Navbar/>
      <Outlet />
    </React.Fragment>
  );
}
