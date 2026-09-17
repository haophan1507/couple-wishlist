import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { WishlistPage } from "@/src/features/wishlist/wishlist-page";

const wishlistSearchSchema = z.object({
  category: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  mePage: z.string().optional().catch(undefined),
  honeyPage: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_public/wishlist")({
  validateSearch: wishlistSearchSchema,
  component: WishlistRoute,
});

function WishlistRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <WishlistPage
      search={search}
      onSearchChange={(patch) => {
        void navigate({
          search: (prev) => ({
            ...prev,
            ...patch,
          }),
          replace: true,
        });
      }}
    />
  );
}
