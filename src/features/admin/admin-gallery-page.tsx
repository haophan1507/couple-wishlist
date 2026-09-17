import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { GalleryForm } from "@/components/admin/gallery-form";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { fetchAdminGalleryPage, queryKeys } from "@/lib/data/client-queries";
import { deleteGalleryItemFn } from "@/src/server/gallery";

const PAGE_SIZE = 6;

export function AdminGalleryPage({ page }: { page: number }) {
  const queryClient = useQueryClient();
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

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">
          Quản lý Khoảnh khắc
        </h1>
        <div className="mt-4">
          <GalleryForm onSuccess={invalidate} />
        </div>
      </section>

      <section>
        <div className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium dark:text-white">
                  {item.caption ?? "Ảnh"}
                </p>
                <ConfirmDeleteButton
                  itemName={item.caption ?? "ảnh này"}
                  onConfirm={() => deleteMutation.mutate(item.id)}
                />
              </div>
              <GalleryForm
                onSuccess={invalidate}
                item={{
                  id: item.id,
                  image_path: item.image_path,
                  caption: item.caption ?? "",
                  memory_date: item.memory_date ?? "",
                }}
              />
            </div>
          ))}
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
