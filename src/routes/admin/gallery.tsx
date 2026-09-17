import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AdminGalleryPage } from "@/src/features/admin/admin-gallery-page";

const searchSchema = z.object({
  page: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/admin/gallery")({
  validateSearch: searchSchema,
  component: AdminGalleryRoute,
});

function AdminGalleryRoute() {
  const { page } = Route.useSearch();
  return <AdminGalleryPage page={Math.max(1, Number(page ?? "1") || 1)} />;
}
