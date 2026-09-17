import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { GalleryPage } from "@/src/features/gallery/gallery-page";

const searchSchema = z.object({
  page: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_public/gallery")({
  validateSearch: searchSchema,
  component: GalleryRoute,
});

function GalleryRoute() {
  const { page } = Route.useSearch();
  return <GalleryPage page={Math.max(1, Number(page ?? "1") || 1)} />;
}
