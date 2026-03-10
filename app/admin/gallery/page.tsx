import { deleteGalleryItemAction } from "@/app/actions/gallery";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { GalleryForm } from "@/components/admin/gallery-form";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getGalleryItems } from "@/lib/data/queries";

export default async function AdminGalleryPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const items = await getGalleryItems();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Quản lý Khoảnh khắc</h1>
        <div className="mt-4">
          <GalleryForm />
        </div>
      </section>

      <section>
        <div className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
        {paginatedItems.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium dark:text-white">{item.caption ?? "Ảnh"}</p>
              <form id={`delete-gallery-${item.id}`} action={deleteGalleryItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmDeleteButton
                  formId={`delete-gallery-${item.id}`}
                  itemName={item.caption ?? "ảnh này"}
                />
              </form>
            </div>
            <GalleryForm
              item={{
                id: item.id,
                image_path: item.image_path,
                caption: item.caption ?? "",
                memory_date: item.memory_date ?? "",
              }}
            />
          </div>
        ))}
        {!items.length ? <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có ảnh nào.</p> : null}
        </div>
        <PaginationControls
          basePath="/admin/gallery"
          currentPage={safePage}
          totalPages={totalPages}
          searchParams={{}}
        />
      </section>
    </>
  );
}
