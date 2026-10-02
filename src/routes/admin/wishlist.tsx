import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  DEFAULT_WISHLIST_STATUS_FILTER,
  WISHLIST_STATUS_FILTER_VALUES,
} from "@/lib/constants/wishlist";
import { AdminWishlistPage } from "@/src/features/admin/admin-wishlist-page";

const searchSchema = z.object({
  page: z.string().optional().catch(undefined),
  status: z.enum(WISHLIST_STATUS_FILTER_VALUES).optional().catch(undefined),
});

export const Route = createFileRoute("/admin/wishlist")({
  validateSearch: searchSchema,
  component: AdminWishlistRoute,
});

function AdminWishlistRoute() {
  const { page, status } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <AdminWishlistPage
      page={Math.max(1, Number(page ?? "1") || 1)}
      status={status ?? DEFAULT_WISHLIST_STATUS_FILTER}
      onStatusChange={(next) => {
        void navigate({
          search: {
            status: next === DEFAULT_WISHLIST_STATUS_FILTER ? undefined : next,
            page: undefined,
          },
          replace: true,
        });
      }}
    />
  );
}
