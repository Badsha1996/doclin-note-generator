import { createFileRoute } from "@tanstack/react-router";
import Login from "./Login";

export const Route = createFileRoute("/login/")({
  component: Login,
});


