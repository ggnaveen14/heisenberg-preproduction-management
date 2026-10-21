import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  component: () => <Outlet />,
});
