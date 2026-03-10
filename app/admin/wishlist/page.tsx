import { deleteWishlistItemAction } from "@/app/actions/wishlist";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { WishlistForm } from "@/components/admin/wishlist-form";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getCoupleProfile, getWishlistItems } from "@/lib/data/queries";
import { parseWishlistProductUrls } from "@/lib/utils/wishlist-links";

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
                product_urls: parseWishlistProductUrls(item.product_url).join("\n"),
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
