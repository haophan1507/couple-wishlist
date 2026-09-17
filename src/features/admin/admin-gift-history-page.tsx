import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { AdminItemRow } from "@/components/admin/admin-item-row";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { GiftHistoryForm } from "@/components/admin/gift-history-form";
import { useAdminEditorMode } from "@/components/admin/use-admin-editor-mode";
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

const PAGE_SIZE = 10;

const statusLabels = {
  received: "Đã nhận",
  thanked: "Đã cảm ơn",
  archived: "Lưu kỷ niệm",
} as const;

export function AdminGiftHistoryPage({ page }: { page: number }) {
  const queryClient = useQueryClient();
  const editor = useAdminEditorMode();

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

  const handleSaved = () => {
    invalidate();
    editor.close();
  };

  return (
    <>
      <AdminListHeader
        title="Kỷ niệm quà"
        description="Lưu lại những món quà đã nhận như một phần ký ức của hai bạn."
        isCreating={editor.isCreating}
        onToggleCreate={() => (editor.isCreating ? editor.close() : editor.openCreate())}
      >
        {editor.isCreating ? (
          <div className="mt-4">
            <GiftHistoryForm
              personOneName={personOneName}
              personTwoName={personTwoName}
              specialDays={specialDays}
              wishlistItems={wishlistItems}
              onSuccess={handleSaved}
              onCancel={editor.close}
            />
          </div>
        ) : null}
      </AdminListHeader>

      <section>
        <div className="space-y-3 pr-1">
          {items.map((item) => {
            const expanded = editor.isEditingId(item.id);
            return (
              <AdminItemRow
                key={item.id}
                title={item.gift_name}
                imagePath={item.photo_path}
                meta={`${item.giver_name} · ${format(parseISO(item.received_date), "dd/MM/yyyy")} · ${statusLabels[item.status]}`}
                isExpanded={expanded}
                onEdit={() => (expanded ? editor.close() : editor.openEdit(item.id))}
                onDelete={async () => {
                  await deleteMutation.mutateAsync(item.id);
                  if (editor.isEditingId(item.id)) editor.close();
                }}
              >
                <GiftHistoryForm
                  personOneName={personOneName}
                  personTwoName={personTwoName}
                  specialDays={specialDays}
                  wishlistItems={wishlistItems}
                  onSuccess={handleSaved}
                  onCancel={editor.close}
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
              </AdminItemRow>
            );
          })}
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
