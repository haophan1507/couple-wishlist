import { deleteGalleryItemAction, upsertGalleryItemAction } from "@/app/actions/gallery";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { getGalleryItems } from "@/lib/data/queries";

function GalleryForm({
  item
}: {
  item?: {
    id: string;
    image_url: string;
    caption: string | null;
    memory_date: string | null;
  };
}) {
  return (
    <form action={upsertGalleryItemAction} className="grid gap-2 rounded-2xl border border-mocha/10 bg-white/60 p-4">
      <input type="hidden" name="id" defaultValue={item?.id ?? ""} />
      <input name="image_url" placeholder="URL ảnh (hoặc tải lên bên dưới)" defaultValue={item?.image_url ?? ""} />
      <input type="file" name="image_file" accept="image/*" />
      <input name="caption" placeholder="Chú thích" defaultValue={item?.caption ?? ""} />
      <input name="memory_date" type="date" defaultValue={item?.memory_date ?? ""} />
      <FormSubmitButton
        idleLabel={item ? "Cập nhật" : "Thêm ảnh"}
        loadingLabel={item ? "Đang cập nhật..." : "Đang thêm..."}
      />
    </form>
  );
}

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Quản lý Khoảnh khắc</h1>
        <div className="mt-4">
          <GalleryForm />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">{item.caption ?? "Ảnh"}</p>
              <form id={`delete-gallery-${item.id}`} action={deleteGalleryItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmDeleteButton
                  formId={`delete-gallery-${item.id}`}
                  itemName={item.caption ?? "ảnh này"}
                />
              </form>
            </div>
            <GalleryForm item={item} />
          </div>
        ))}
        {!items.length ? <p className="card p-6 text-sm text-mocha/70">Chưa có ảnh nào.</p> : null}
      </section>
    </>
  );
}
