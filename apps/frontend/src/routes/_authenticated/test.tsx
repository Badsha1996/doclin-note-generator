import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/test")({
  component: About,
});

function About() {
  return <div>Hello "/about/"!</div>;
}
