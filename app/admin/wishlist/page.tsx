import { deleteWishlistItemAction, upsertWishlistItemAction } from "@/app/actions/wishlist";
import { getWishlistItems } from "@/lib/data/queries";

const defaultValues = {
  id: "",
  owner_type: "me",
  title: "",
  description: "",
  image_url: "",
  product_url: "",
  price_min: "",
  price_max: "",
  category: "",
  priority: "medium",
  note: "",
  status: "available"
};

type WishlistFormItem = {
  id: string;
  owner_type: string;
  title: string;
  description: string;
  image_url: string;
  product_url: string;
  price_min: string;
  price_max: string;
  category: string;
  priority: string;
  note: string;
  status: string;
};

function WishlistForm({ item = defaultValues }: { item?: WishlistFormItem }) {
  return (
    <form action={upsertWishlistItemAction} className="grid gap-2 rounded-2xl border border-mocha/10 bg-white/60 p-4">
      <input type="hidden" name="id" defaultValue={item.id ?? ""} />
      <div className="grid gap-2 md:grid-cols-2">
        <select name="owner_type" defaultValue={item.owner_type ?? "me"}>
          <option value="me">Wishlist của mình</option>
          <option value="honey">Wishlist người thương</option>
        </select>
        <input name="title" placeholder="Tiêu đề" defaultValue={item.title ?? ""} required />
      </div>
      <textarea name="description" rows={2} placeholder="Mô tả" defaultValue={item.description ?? ""} />
      <div className="grid gap-2 md:grid-cols-2">
        <input name="image_url" placeholder="URL ảnh" defaultValue={item.image_url ?? ""} />
        <input name="product_url" placeholder="Link sản phẩm" defaultValue={item.product_url ?? ""} />
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        <input name="price_min" type="number" placeholder="Giá thấp nhất" defaultValue={item.price_min ?? ""} />
        <input name="price_max" type="number" placeholder="Giá cao nhất" defaultValue={item.price_max ?? ""} />
        <input name="category" placeholder="Danh mục" defaultValue={item.category ?? ""} />
        <select name="priority" defaultValue={item.priority ?? "medium"}>
          <option value="low">Thấp</option>
          <option value="medium">Trung bình</option>
          <option value="high">Cao</option>
        </select>
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_180px]">
        <textarea name="note" rows={2} placeholder="Ghi chú" defaultValue={item.note ?? ""} />
        <select name="status" defaultValue={item.status ?? "available"}>
          <option value="available">Có sẵn</option>
          <option value="reserved">Đã đặt trước</option>
          <option value="gifted">Đã tặng</option>
        </select>
      </div>
      <button type="submit" className="w-fit rounded-xl bg-mocha px-4 py-2 text-sm text-white">
        {item.id ? "Cập nhật" : "Thêm món"}
      </button>
    </form>
  );
}

export default async function AdminWishlistPage() {
  const items = await getWishlistItems();

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Quản lý Danh Sách Quà</h1>
        <p className="mt-1 text-sm text-mocha/70">Tạo mới và chỉnh sửa món quà.</p>
        <div className="mt-4">
          <WishlistForm />
        </div>
      </section>

      <section className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">{item.title}</p>
              <form action={deleteWishlistItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="text-xs text-red-600">
                  Xóa
                </button>
              </form>
            </div>
            <WishlistForm
              item={{
                id: item.id,
                owner_type: item.owner_type,
                title: item.title,
                description: item.description ?? "",
                image_url: item.image_url ?? "",
                product_url: item.product_url ?? "",
                price_min: item.price_min?.toString() ?? "",
                price_max: item.price_max?.toString() ?? "",
                category: item.category ?? "",
                priority: item.priority,
                note: item.note ?? "",
                status: item.status
              }}
            />
          </div>
        ))}
        {!items.length ? <p className="card p-6 text-sm text-mocha/70">Chưa có món quà nào.</p> : null}
      </section>
    </>
  );
}
