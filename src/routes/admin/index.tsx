import { createFileRoute } from "@tanstack/react-router";
import { AdminHomePage } from "@/src/features/admin/admin-home-page";

export const Route = createFileRoute("/admin/")({
  component: AdminHomePage,
});
