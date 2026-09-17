import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AdminWishlistPage } from "@/src/features/admin/admin-wishlist-page";

const searchSchema = z.object({
  page: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/admin/wishlist")({
  validateSearch: searchSchema,
  component: AdminWishlistRoute,
});

function AdminWishlistRoute() {
  const { page } = Route.useSearch();
  return <AdminWishlistPage page={Math.max(1, Number(page ?? "1") || 1)} />;
}
