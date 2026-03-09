import { deleteGalleryItemAction, upsertGalleryItemAction } from "@/app/actions/gallery";
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
      <button type="submit" className="w-fit rounded-xl bg-mocha px-4 py-2 text-sm text-white">
        {item ? "Cập nhật" : "Thêm ảnh"}
      </button>
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
              <form action={deleteGalleryItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="text-xs text-red-600">
                  Xóa
                </button>
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
