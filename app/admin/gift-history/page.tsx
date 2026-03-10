import {
  deleteGiftHistoryItemAction,
} from "@/app/actions/gift-history";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { GiftHistoryForm } from "@/components/admin/gift-history-form";
import {
  getCoupleProfile,
  getGiftHistoryItems,
  getSpecialDays,
  getWishlistItems,
} from "@/lib/data/queries";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default async function AdminGiftHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const [profile, items, specialDays, wishlistItems] = await Promise.all([
    getCoupleProfile(),
    getGiftHistoryItems(),
    getSpecialDays(),
    getWishlistItems(),
  ]);
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  const personOneName = profile?.person_one_name?.trim() || "Bạn 1";
  const personTwoName = profile?.person_two_name?.trim() || "Bạn 2";

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Lịch sử quà tặng</h1>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
          Lưu lại những món quà đã nhận như một phần ký ức của hai bạn.
        </p>
        <div className="mt-4">
          <GiftHistoryForm
            personOneName={personOneName}
            personTwoName={personTwoName}
            specialDays={specialDays.map((day) => ({ id: day.id, title: day.title }))}
            wishlistItems={wishlistItems.map((item) => ({
              id: item.id,
              title: item.title,
              owner_type: item.owner_type,
            }))}
          />
        </div>
      </section>

      <section>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
        {paginatedItems.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium dark:text-white">{item.gift_name}</p>
                <p className="mt-1 text-xs text-mocha/65 dark:text-white/45">
                  {item.giver_name} tặng cho{" "}
                  {item.recipient_owner_type === "me" ? personOneName : personTwoName}
                </p>
              </div>
              <form id={`delete-gift-history-${item.id}`} action={deleteGiftHistoryItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmDeleteButton formId={`delete-gift-history-${item.id}`} itemName={item.gift_name} />
              </form>
            </div>

            <GiftHistoryForm
              personOneName={personOneName}
              personTwoName={personTwoName}
              specialDays={specialDays.map((day) => ({ id: day.id, title: day.title }))}
              wishlistItems={wishlistItems.map((wishlistItem) => ({
                id: wishlistItem.id,
                title: wishlistItem.title,
                owner_type: wishlistItem.owner_type,
              }))}
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
          </div>
        ))}
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
          searchParams={{}}
        />
      </section>
    </>
  );
}
