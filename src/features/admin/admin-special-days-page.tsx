import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminItemRow } from "@/components/admin/admin-item-row";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { SpecialDayForm } from "@/components/admin/special-day-form";
import { useAdminEditorMode } from "@/components/admin/use-admin-editor-mode";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import {
  fetchAdminSpecialDaysPage,
  queryKeys,
} from "@/lib/data/client-queries";
import { deleteSpecialDayFn } from "@/src/server/special-days";

const PAGE_SIZE = 5;

export function AdminSpecialDaysPage({ page }: { page: number }) {
  const queryClient = useQueryClient();
  const editor = useAdminEditorMode();
  const listQuery = useQuery({
    queryKey: queryKeys.adminSpecialDaysPage({ page, pageSize: PAGE_SIZE }),
    queryFn: () => fetchAdminSpecialDaysPage(page, PAGE_SIZE),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "special-days"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.specialDays });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.set("id", id);
      await deleteSpecialDayFn({ data: formData });
    },
    onSuccess: invalidate,
  });

  if (listQuery.isPending && !listQuery.data) {
    return <SectionSkeleton cards={3} withTitle />;
  }

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
        title="Quản lý Ngày Đặc Biệt"
        isCreating={editor.isCreating}
        onToggleCreate={() => (editor.isCreating ? editor.close() : editor.openCreate())}
      >
        {editor.isCreating ? (
          <div className="mt-4">
            <SpecialDayForm onSuccess={handleSaved} onCancel={editor.close} />
          </div>
        ) : null}
      </AdminListHeader>

      <section>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
          {items.map((item) => {
            const expanded = editor.isEditingId(item.id);
            return (
              <AdminItemRow
                key={item.id}
                title={item.title}
                meta={`${item.date} · ${item.type}`}
                isExpanded={expanded}
                onEdit={() => (expanded ? editor.close() : editor.openEdit(item.id))}
                onDelete={async () => {
                  await deleteMutation.mutateAsync(item.id);
                  if (editor.isEditingId(item.id)) editor.close();
                }}
              >
                <SpecialDayForm
                  onSuccess={handleSaved}
                  onCancel={editor.close}
                  item={{
                    id: item.id,
                    title: item.title,
                    description: item.description ?? "",
                    date: item.date,
                    type: item.type,
                  }}
                />
              </AdminItemRow>
            );
          })}
          {!items.length ? (
            <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
              Chưa có ngày đặc biệt nào.
            </p>
          ) : null}
        </div>
        <PaginationControls
          basePath="/admin/special-days"
          currentPage={safePage}
          totalPages={totalPages}
        />
      </section>
    </>
  );
}
