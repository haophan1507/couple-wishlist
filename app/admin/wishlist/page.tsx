import { deleteWishlistItemAction, upsertWishlistItemAction } from "@/app/actions/wishlist";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getCoupleProfile, getWishlistItems } from "@/lib/data/queries";

const defaultValues = {
  id: "",
  owner_type: "me",
  title: "",
  description: "",
  image_path: "",
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
  image_path: string;
  product_url: string;
  price_min: string;
  price_max: string;
  category: string;
  priority: string;
  note: string;
  status: string;
};

function WishlistForm({
  item = defaultValues,
  personOneName,
  personTwoName
}: {
  item?: WishlistFormItem;
  personOneName: string;
  personTwoName: string;
}) {
  return (
    <form action={upsertWishlistItemAction} className="grid gap-2 rounded-2xl border border-mocha/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <input type="hidden" name="id" defaultValue={item.id ?? ""} />
      <div className="grid gap-2 md:grid-cols-2">
        <select name="owner_type" defaultValue={item.owner_type ?? "me"}>
          <option value="me">Quà cho {personOneName}</option>
          <option value="honey">Quà cho {personTwoName}</option>
        </select>
        <input name="title" placeholder="Tiêu đề" defaultValue={item.title ?? ""} required />
      </div>
      <textarea name="description" rows={2} placeholder="Mô tả" defaultValue={item.description ?? ""} />
      <div className="grid gap-2 md:grid-cols-2">
        <input type="hidden" name="existing_image_path" defaultValue={item.image_path ?? ""} />
        <input type="file" name="image_file" accept="image/*" />
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
          <option value="gifted">Đã tặng</option>
        </select>
      </div>
      <FormSubmitButton
        idleLabel={item.id ? "Cập nhật" : "Thêm món"}
        loadingLabel={item.id ? "Đang cập nhật..." : "Đang thêm..."}
      />
    </form>
  );
}

export default async function AdminWishlistPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const [items, profile] = await Promise.all([getWishlistItems(), getCoupleProfile()]);
  const personOneName = profile?.person_one_name?.trim() || "Bạn 1";
  const personTwoName = profile?.person_two_name?.trim() || "Bạn 2";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Quản lý Danh Sách Quà</h1>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">Tạo mới và chỉnh sửa món quà.</p>
        <div className="mt-4">
          <WishlistForm personOneName={personOneName} personTwoName={personTwoName} />
        </div>
      </section>

      <section>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
        {paginatedItems.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium dark:text-white">{item.title}</p>
              <form id={`delete-wishlist-${item.id}`} action={deleteWishlistItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmDeleteButton formId={`delete-wishlist-${item.id}`} itemName={item.title} />
              </form>
            </div>
            <WishlistForm
              personOneName={personOneName}
              personTwoName={personTwoName}
              item={{
                id: item.id,
                owner_type: item.owner_type,
                title: item.title,
                description: item.description ?? "",
                image_path: item.image_path ?? "",
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
        {!items.length ? <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có món quà nào.</p> : null}
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
