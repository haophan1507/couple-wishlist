import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { WishlistForm } from "@/components/admin/wishlist-form";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import {
  fetchAdminWishlistPage,
  fetchCoupleProfile,
  queryKeys,
} from "@/lib/data/client-queries";
import { parseWishlistProductUrls } from "@/lib/utils/wishlist-links";
import { deleteWishlistItemFn } from "@/src/server/wishlist";

const PAGE_SIZE = 4;

type AdminWishlistPageProps = {
  page: number;
};

export function AdminWishlistPage({ page }: AdminWishlistPageProps) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: queryKeys.coupleProfile,
    queryFn: fetchCoupleProfile,
  });
  const listQuery = useQuery({
    queryKey: queryKeys.adminWishlistPage({ page, pageSize: PAGE_SIZE }),
    queryFn: () => fetchAdminWishlistPage(page, PAGE_SIZE),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "wishlist"] });
    void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.coupleProfile });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.set("id", id);
      await deleteWishlistItemFn({ data: formData });
    },
    onSuccess: invalidate,
  });

  if ((profileQuery.isPending || listQuery.isPending) && !listQuery.data) {
    return <SectionSkeleton cards={3} withTitle />;
  }

  const profile = profileQuery.data;
  const personOneName = profile?.person_one_name?.trim() || "Bạn 1";
  const personTwoName = profile?.person_two_name?.trim() || "Bạn 2";
  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = listQuery.data?.items ?? [];

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Quản lý wishlist</h1>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
          Tạo mới và chỉnh sửa món quà, điều muốn có hoặc ý tưởng bất ngờ.
        </p>
        <div className="mt-4">
          <WishlistForm
            personOneName={personOneName}
            personTwoName={personTwoName}
            onSuccess={invalidate}
          />
        </div>
      </section>

      <section>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium dark:text-white">{item.title}</p>
                <ConfirmDeleteButton
                  formId={`delete-wishlist-${item.id}`}
                  itemName={item.title}
                  onConfirm={() => deleteMutation.mutate(item.id)}
                />
              </div>
              <WishlistForm
                personOneName={personOneName}
                personTwoName={personTwoName}
                onSuccess={invalidate}
                item={{
                  id: item.id,
                  owner_type: item.owner_type,
                  title: item.title,
                  description: item.description ?? "",
                  image_path: item.image_path ?? "",
                  product_urls: parseWishlistProductUrls(item.product_url).join("\n"),
                  price_min: item.price_min?.toString() ?? "",
                  price_max: item.price_max?.toString() ?? "",
                  category: item.category ?? "",
                  priority: item.priority,
                  note: item.note ?? "",
                  status: item.status,
                }}
              />
            </div>
          ))}
          {!items.length ? (
            <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
              Chưa có món quà nào.
            </p>
          ) : null}
        </div>
        <PaginationControls
          basePath="/admin/wishlist"
          currentPage={safePage}
          totalPages={totalPages}
          searchParams={{}}
        />
      </section>
    </>
  );
}
