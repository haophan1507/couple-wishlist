import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AdminItemRow } from "@/components/admin/admin-item-row";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { GalleryForm } from "@/components/admin/gallery-form";
import { useAdminEditorMode } from "@/components/admin/use-admin-editor-mode";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { fetchAdminGalleryPage, queryKeys } from "@/lib/data/client-queries";
import { deleteGalleryItemFn } from "@/src/server/gallery";

const PAGE_SIZE = 10;

export function AdminGalleryPage({ page }: { page: number }) {
  const queryClient = useQueryClient();
  const editor = useAdminEditorMode();
  const listQuery = useQuery({
    queryKey: queryKeys.adminGalleryPage({ page, pageSize: PAGE_SIZE }),
    queryFn: () => fetchAdminGalleryPage(page, PAGE_SIZE),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    void queryClient.invalidateQueries({ queryKey: ["gallery"] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.set("id", id);
      await deleteGalleryItemFn({ data: formData });
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
        title="Quản lý Khoảnh khắc"
        isCreating={editor.isCreating}
        onToggleCreate={() => (editor.isCreating ? editor.close() : editor.openCreate())}
      >
        {editor.isCreating ? (
          <div className="mt-4">
            <GalleryForm onSuccess={handleSaved} onCancel={editor.close} />
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
                title={item.caption ?? "Ảnh"}
                imagePath={item.image_path}
                meta={item.memory_date ? format(new Date(item.memory_date), "PPP") : undefined}
                itemNameForDelete={item.caption ?? "ảnh này"}
                isExpanded={expanded}
                onEdit={() => (expanded ? editor.close() : editor.openEdit(item.id))}
                onDelete={async () => {
                  await deleteMutation.mutateAsync(item.id);
                  if (editor.isEditingId(item.id)) editor.close();
                }}
              >
                <GalleryForm
                  onSuccess={handleSaved}
                  onCancel={editor.close}
                  item={{
                    id: item.id,
                    image_path: item.image_path,
                    caption: item.caption ?? "",
                    memory_date: item.memory_date ?? "",
                  }}
                />
              </AdminItemRow>
            );
          })}
          {!items.length ? (
            <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
              Chưa có ảnh nào.
            </p>
          ) : null}
        </div>
        <PaginationControls
          basePath="/admin/gallery"
          currentPage={safePage}
          totalPages={totalPages}
        />
      </section>
    </>
  );
}
