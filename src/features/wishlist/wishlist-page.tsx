import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { WishlistFilter, type WishlistSearch } from "@/components/wishlist-filter";
import { WishlistCard } from "@/components/wishlist-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { Container } from "@/components/ui/container";
import {
  fetchCoupleProfile,
  fetchWishlistCategories,
  fetchWishlistPage,
  queryKeys,
} from "@/lib/data/client-queries";

const PAGE_SIZE = 6;

type WishlistPageProps = {
  search: WishlistSearch;
  onSearchChange: (patch: Partial<WishlistSearch>) => void;
};

export function WishlistPage({ search, onSearchChange }: WishlistPageProps) {
  const category = search.category;
  const q = search.q;
  const mePage = Math.max(1, Number(search.mePage ?? "1") || 1);
  const honeyPage = Math.max(1, Number(search.honeyPage ?? "1") || 1);

  const profileQuery = useQuery({
    queryKey: queryKeys.coupleProfile,
    queryFn: fetchCoupleProfile,
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.wishlistCategories,
    queryFn: fetchWishlistCategories,
  });
  const meQuery = useQuery({
    queryKey: queryKeys.wishlistPage({
      ownerType: "me",
      page: mePage,
      pageSize: PAGE_SIZE,
      q,
      category,
    }),
    queryFn: () =>
      fetchWishlistPage({
        ownerType: "me",
        page: mePage,
        pageSize: PAGE_SIZE,
        query: q,
        category,
      }),
    placeholderData: keepPreviousData,
  });
  const honeyQuery = useQuery({
    queryKey: queryKeys.wishlistPage({
      ownerType: "honey",
      page: honeyPage,
      pageSize: PAGE_SIZE,
      q,
      category,
    }),
    queryFn: () =>
      fetchWishlistPage({
        ownerType: "honey",
        page: honeyPage,
        pageSize: PAGE_SIZE,
        query: q,
        category,
      }),
    placeholderData: keepPreviousData,
  });

  const isLoading =
    profileQuery.isPending ||
    categoriesQuery.isPending ||
    meQuery.isPending ||
    honeyQuery.isPending;

  if (isLoading && !meQuery.data && !honeyQuery.data) {
    return (
      <section className="py-10 md:py-12">
        <Container>
          <h1 className="section-title">Wishlist</h1>
          <p className="section-subtitle">
            Hai bạn cùng cập nhật món quà, điều muốn có và ý tưởng bất ngờ dành cho
            nhau.
          </p>
          <SectionSkeleton cards={6} />
        </Container>
      </section>
    );
  }

  const profile = profileQuery.data;
  const meTotal = meQuery.data?.total ?? 0;
  const honeyTotal = honeyQuery.data?.total ?? 0;
  const meTotalPages = Math.max(1, Math.ceil(meTotal / PAGE_SIZE));
  const honeyTotalPages = Math.max(1, Math.ceil(honeyTotal / PAGE_SIZE));
  const safeMePage = Math.min(mePage, meTotalPages);
  const safeHoneyPage = Math.min(honeyPage, honeyTotalPages);

  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title">Wishlist</h1>
        <p className="section-subtitle">
          Hai bạn cùng cập nhật món quà, điều muốn có và ý tưởng bất ngờ dành cho
          nhau.
        </p>

        <WishlistFilter
          categories={categoriesQuery.data ?? []}
          search={search}
          isFetching={meQuery.isFetching || honeyQuery.isFetching}
          onSearchChange={(patch) =>
            onSearchChange({
              ...patch,
              mePage: undefined,
              honeyPage: undefined,
            })
          }
        />

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold dark:text-white">
              Wishlist của {profile?.person_one_name ?? "mình"}
            </h2>
            <div className="mt-4 max-h-[70vh] overflow-y-auto px-1 pb-5 pt-1">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(meQuery.data?.items ?? []).map((item) => (
                  <WishlistCard key={item.id} item={item} />
                ))}
                {!meTotal ? (
                  <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
                    Chưa có món quà nào.
                  </p>
                ) : null}
              </div>
            </div>
            <PaginationControls
              basePath="/wishlist"
              currentPage={safeMePage}
              totalPages={meTotalPages}
              pageParam="mePage"
              searchParams={{
                category,
                q,
                honeyPage:
                  honeyTotalPages > 1 || safeHoneyPage > 1
                    ? String(safeHoneyPage)
                    : undefined,
              }}
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold dark:text-white">
              Wishlist của {profile?.person_two_name ?? "người thương"}
            </h2>
            <div className="mt-4 max-h-[70vh] overflow-y-auto px-1 pb-5 pt-1">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(honeyQuery.data?.items ?? []).map((item) => (
                  <WishlistCard key={item.id} item={item} />
                ))}
                {!honeyTotal ? (
                  <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
                    Chưa có món quà nào.
                  </p>
                ) : null}
              </div>
            </div>
            <PaginationControls
              basePath="/wishlist"
              currentPage={safeHoneyPage}
              totalPages={honeyTotalPages}
              pageParam="honeyPage"
              searchParams={{
                category,
                q,
                mePage:
                  meTotalPages > 1 || safeMePage > 1
                    ? String(safeMePage)
                    : undefined,
              }}
            />
          </section>
        </div>
      </Container>
    </section>
  );
}
