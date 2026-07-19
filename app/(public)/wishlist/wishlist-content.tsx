import { Suspense } from "react";
import { WishlistFilter } from "@/components/wishlist-filter";
import { WishlistCard } from "@/components/wishlist-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { getCoupleProfile, getWishlistCategories, getWishlistItems } from "@/lib/data/queries";

type WishlistSearchParams = {
  category?: string;
  q?: string;
  mePage?: string;
  honeyPage?: string;
};

export async function WishlistPageContent({
  searchParams,
}: {
  searchParams: Promise<WishlistSearchParams>;
}) {
  const params = await searchParams;

  const [profile, categories, items] = await Promise.all([
    getCoupleProfile(),
    getWishlistCategories(),
    getWishlistItems({
      category: params.category,
      query: params.q,
    }),
  ]);

  const meItems = items.filter((item) => item.owner_type === "me");
  const honeyItems = items.filter((item) => item.owner_type === "honey");
  const pageSize = 6;
  const mePage = Math.max(1, Number(params.mePage ?? "1") || 1);
  const honeyPage = Math.max(1, Number(params.honeyPage ?? "1") || 1);
  const meTotalPages = Math.max(1, Math.ceil(meItems.length / pageSize));
  const honeyTotalPages = Math.max(1, Math.ceil(honeyItems.length / pageSize));
  const safeMePage = Math.min(mePage, meTotalPages);
  const safeHoneyPage = Math.min(honeyPage, honeyTotalPages);
  const paginatedMeItems = meItems.slice((safeMePage - 1) * pageSize, safeMePage * pageSize);
  const paginatedHoneyItems = honeyItems.slice((safeHoneyPage - 1) * pageSize, safeHoneyPage * pageSize);

  return (
    <>
      <Suspense>
        <WishlistFilter categories={categories} />
      </Suspense>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold dark:text-white">
            Wishlist của {profile?.person_one_name ?? "mình"}
          </h2>
          <div className="mt-4 max-h-[70vh] overflow-y-auto px-1 pb-5 pt-1">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedMeItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
              {!meItems.length ? (
                <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có món quà nào.</p>
              ) : null}
            </div>
          </div>
          <PaginationControls
            basePath="/wishlist"
            currentPage={safeMePage}
            totalPages={meTotalPages}
            pageParam="mePage"
            searchParams={{
              category: params.category,
              q: params.q,
              honeyPage: honeyTotalPages > 1 || safeHoneyPage > 1 ? String(safeHoneyPage) : undefined,
            }}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold dark:text-white">
            Wishlist của {profile?.person_two_name ?? "người thương"}
          </h2>
          <div className="mt-4 max-h-[70vh] overflow-y-auto px-1 pb-5 pt-1">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedHoneyItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
              {!honeyItems.length ? (
                <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có món quà nào.</p>
              ) : null}
            </div>
          </div>
          <PaginationControls
            basePath="/wishlist"
            currentPage={safeHoneyPage}
            totalPages={honeyTotalPages}
            pageParam="honeyPage"
            searchParams={{
              category: params.category,
              q: params.q,
              mePage: meTotalPages > 1 || safeMePage > 1 ? String(safeMePage) : undefined,
            }}
          />
        </section>
      </div>
    </>
  );
}

export function WishlistContentFallback() {
  return <SectionSkeleton cards={6} />;
}
