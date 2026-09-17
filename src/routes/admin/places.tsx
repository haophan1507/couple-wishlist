import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AdminPlacesPage } from "@/src/features/admin/admin-places-page";

const searchSchema = z.object({
  page: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/admin/places")({
  validateSearch: searchSchema,
  component: AdminPlacesRoute,
});

function AdminPlacesRoute() {
  const { page } = Route.useSearch();
  return <AdminPlacesPage page={Math.max(1, Number(page ?? "1") || 1)} />;
}
