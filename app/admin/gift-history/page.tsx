import {
  deleteGiftHistoryItemAction,
  upsertGiftHistoryItemAction,
} from "@/app/actions/gift-history";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import {
  getCoupleProfile,
  getGiftHistoryItems,
  getSpecialDays,
  getWishlistItems,
} from "@/lib/data/queries";

type GiftHistoryFormItem = {
  id: string;
  recipient_owner_type: "me" | "honey";
  gift_name: string;
  giver_name: string;
  received_date: string;
  special_day_id: string;
  note: string;
  photo_path: string;
  photo_alt: string;
  wishlist_item_id: string;
  status: "received" | "thanked" | "archived";
};

const defaultValues: GiftHistoryFormItem = {
  id: "",
  recipient_owner_type: "me",
  gift_name: "",
  giver_name: "",
  received_date: "",
  special_day_id: "",
  note: "",
  photo_path: "",
  photo_alt: "",
  wishlist_item_id: "",
  status: "received",
};

function GiftHistoryForm({
  item = defaultValues,
  personOneName,
  personTwoName,
  specialDays,
  wishlistItems,
}: {
  item?: GiftHistoryFormItem;
  personOneName: string;
  personTwoName: string;
  specialDays: Array<{ id: string; title: string }>;
  wishlistItems: Array<{ id: string; title: string; owner_type: "me" | "honey" }>;
}) {
  return (
    <form
      action={upsertGiftHistoryItemAction}
      className="grid gap-3 rounded-2xl border border-mocha/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
    >
      <input type="hidden" name="id" defaultValue={item.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
            Người nhận
          </span>
          <select name="recipient_owner_type" defaultValue={item.recipient_owner_type}>
            <option value="me">{personOneName}</option>
            <option value="honey">{personTwoName}</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
            Trạng thái
          </span>
          <select name="status" defaultValue={item.status}>
            <option value="received">Đã nhận</option>
            <option value="thanked">Đã cảm ơn</option>
            <option value="archived">Lưu kỷ niệm</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
            Tên món quà
          </span>
          <input name="gift_name" defaultValue={item.gift_name} placeholder="Ví dụ: Máy ảnh film bỏ túi" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
            Người tặng
          </span>
          <input name="giver_name" defaultValue={item.giver_name} placeholder="Ví dụ: Trà" required />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
            Ngày nhận
          </span>
          <input name="received_date" type="date" defaultValue={item.received_date} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
            Dịp đặc biệt
          </span>
          <select name="special_day_id" defaultValue={item.special_day_id}>
            <option value="">Không gắn dịp cụ thể</option>
            {specialDays.map((day) => (
              <option key={day.id} value={day.id}>
                {day.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
          Link tới wishlist gốc
        </span>
        <select name="wishlist_item_id" defaultValue={item.wishlist_item_id}>
          <option value="">Không liên kết wishlist</option>
          {wishlistItems.map((wishlistItem) => (
            <option key={wishlistItem.id} value={wishlistItem.id}>
              {wishlistItem.owner_type === "me" ? personOneName : personTwoName}: {wishlistItem.title}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
            Ảnh kỷ niệm
          </span>
          <input type="hidden" name="existing_photo_path" defaultValue={item.photo_path} />
          <input type="file" name="photo_file" accept="image/*" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
            Mô tả ảnh
          </span>
          <input name="photo_alt" defaultValue={item.photo_alt} placeholder="Ví dụ: bó tulip trong tối kỷ niệm" />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
          Ghi chú kỷ niệm
        </span>
        <textarea
          name="note"
          rows={4}
          defaultValue={item.note}
          placeholder="Ví dụ: Món quà đầu tiên sau chuyến đi Đà Lạt, vẫn còn giữ hộp quà và tấm thiệp."
        />
      </label>

      <FormSubmitButton
        idleLabel={item.id ? "Cập nhật kỷ niệm quà" : "Thêm kỷ niệm quà"}
        loadingLabel={item.id ? "Đang cập nhật..." : "Đang thêm..."}
      />
    </form>
  );
}

export default async function AdminGiftHistoryPage() {
  const [profile, items, specialDays, wishlistItems] = await Promise.all([
    getCoupleProfile(),
    getGiftHistoryItems(),
    getSpecialDays(),
    getWishlistItems(),
  ]);
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

      <section className="space-y-3">
        {items.map((item) => (
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
                photo_alt: item.photo_alt ?? "",
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
      </section>
    </>
  );
}
