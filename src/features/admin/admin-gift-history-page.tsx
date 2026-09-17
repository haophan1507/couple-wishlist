import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { GiftHistoryForm } from "@/components/admin/gift-history-form";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import {
  fetchAdminGiftHistoryPage,
  fetchCoupleProfile,
  fetchSpecialDays,
  fetchWishlistOptions,
  queryKeys,
} from "@/lib/data/client-queries";
import { deleteGiftHistoryItemFn } from "@/src/server/gift-history";

const PAGE_SIZE = 4;

export function AdminGiftHistoryPage({ page }: { page: number }) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: queryKeys.coupleProfile,
    queryFn: fetchCoupleProfile,
  });
  const daysQuery = useQuery({
    queryKey: queryKeys.specialDays,
    queryFn: fetchSpecialDays,
  });
  const wishlistQuery = useQuery({
    queryKey: queryKeys.wishlistOptions,
    queryFn: fetchWishlistOptions,
  });
  const listQuery = useQuery({
    queryKey: queryKeys.adminGiftHistoryPage({ page, pageSize: PAGE_SIZE }),
    queryFn: () => fetchAdminGiftHistoryPage(page, PAGE_SIZE),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "gift-history"] });
    void queryClient.invalidateQueries({ queryKey: ["gift-history"] });
    void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.set("id", id);
      await deleteGiftHistoryItemFn({ data: formData });
    },
    onSuccess: invalidate,
  });

  if (
    (profileQuery.isPending ||
      daysQuery.isPending ||
      wishlistQuery.isPending ||
      listQuery.isPending) &&
    !listQuery.data
  ) {
    return <SectionSkeleton cards={3} withTitle />;
  }

  const profile = profileQuery.data;
  const personOneName = profile?.person_one_name?.trim() || "Bạn 1";
  const personTwoName = profile?.person_two_name?.trim() || "Bạn 2";
  const specialDays = (daysQuery.data ?? []).map((day) => ({
    id: day.id,
    title: day.title,
  }));
  const wishlistItems = wishlistQuery.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = listQuery.data?.items ?? [];

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Kỷ niệm quà</h1>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
          Lưu lại những món quà đã nhận như một phần ký ức của hai bạn.
        </p>
        <div className="mt-4">
          <GiftHistoryForm
            personOneName={personOneName}
            personTwoName={personTwoName}
            specialDays={specialDays}
            wishlistItems={wishlistItems}
            onSuccess={invalidate}
          />
        </div>
      </section>

      <section>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    {item.gift_name}
                  </p>
                  <p className="mt-1 text-xs text-mocha/65 dark:text-white/45">
                    {item.giver_name} tặng cho{" "}
                    {item.recipient_owner_type === "me"
                      ? personOneName
                      : personTwoName}
                  </p>
                </div>
                <ConfirmDeleteButton
                  itemName={item.gift_name}
                  onConfirm={() => deleteMutation.mutate(item.id)}
                />
              </div>
              <GiftHistoryForm
                personOneName={personOneName}
                personTwoName={personTwoName}
                specialDays={specialDays}
                wishlistItems={wishlistItems}
                onSuccess={invalidate}
                item={{
                  id: item.id,
                  recipient_owner_type: item.recipient_owner_type,
                  gift_name: item.gift_name,
                  giver_name: item.giver_name,
                  received_date: item.received_date,
                  special_day_id: item.special_day_id ?? "",
                  note: item.note ?? "",
                  photo_path: item.photo_path ?? "",
                  wishlist_item_id: item.wishlist_item_id ?? "",
                  status: item.status,
                }}
              />
            </div>
          ))}
          {!items.length ? (
            <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
              Chưa có món quà nào được lưu vào lịch sử.
            </p>
          ) : null}
        </div>
        <PaginationControls
          basePath="/admin/gift-history"
          currentPage={safePage}
          totalPages={totalPages}
        />
      </section>
    </>
  );
}
