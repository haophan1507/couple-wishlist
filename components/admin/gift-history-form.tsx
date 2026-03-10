"use client";

import { useState } from "react";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { upsertGiftHistoryItemAction } from "@/app/actions/gift-history";

type GiftHistoryFormValues = {
  id: string;
  recipient_owner_type: "me" | "honey";
  gift_name: string;
  giver_name: string;
  received_date: string;
  special_day_id: string;
  note: string;
  photo_path: string;
  wishlist_item_id: string;
  status: "received" | "thanked" | "archived";
};

const defaultValues: GiftHistoryFormValues = {
  id: "",
  recipient_owner_type: "me",
  gift_name: "",
  giver_name: "",
  received_date: "",
  special_day_id: "",
  note: "",
  photo_path: "",
  wishlist_item_id: "",
  status: "received",
};

export function GiftHistoryForm({
  item = defaultValues,
  personOneName,
  personTwoName,
  specialDays,
  wishlistItems,
}: {
  item?: GiftHistoryFormValues;
  personOneName: string;
  personTwoName: string;
  specialDays: Array<{ id: string; title: string }>;
  wishlistItems: Array<{ id: string; title: string; owner_type: "me" | "honey" }>;
}) {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const isEditing = Boolean(item.id);

  return (
    <Formik<GiftHistoryFormValues>
      initialValues={item}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        const formData = new FormData();
        formData.set("id", values.id ?? "");
        formData.set("recipient_owner_type", values.recipient_owner_type);
        formData.set("gift_name", values.gift_name.trim());
        formData.set("giver_name", values.giver_name.trim());
        formData.set("received_date", values.received_date);
        formData.set("special_day_id", values.special_day_id);
        formData.set("note", values.note.trim());
        formData.set("existing_photo_path", values.photo_path ?? "");
        formData.set("wishlist_item_id", values.wishlist_item_id);
        formData.set("status", values.status);

        if (photoFile) {
          formData.set("photo_file", photoFile);
        }

        try {
          await upsertGiftHistoryItemAction(formData);
          setPhotoFile(null);
          router.refresh();
          if (!isEditing) {
            helpers.resetForm();
          }
        } catch (error) {
          helpers.setStatus(error instanceof Error ? error.message : "Không thể lưu lịch sử quà.");
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <form
          onSubmit={formik.handleSubmit}
          className="grid gap-3 rounded-2xl border border-mocha/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <input type="hidden" name="id" value={formik.values.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
                Người nhận
              </span>
              <select
                name="recipient_owner_type"
                value={formik.values.recipient_owner_type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="me">{personOneName}</option>
                <option value="honey">{personTwoName}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
                Trạng thái
              </span>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
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
              <input
                name="gift_name"
                value={formik.values.gift_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ví dụ: Máy ảnh film bỏ túi"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
                Người tặng
              </span>
              <input
                name="giver_name"
                value={formik.values.giver_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ví dụ: Trà"
                required
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
                Ngày nhận
              </span>
              <input
                name="received_date"
                type="date"
                value={formik.values.received_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
                Dịp đặc biệt
              </span>
              <select
                name="special_day_id"
                value={formik.values.special_day_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
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
            <select
              name="wishlist_item_id"
              value={formik.values.wishlist_item_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
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
              <input type="hidden" name="existing_photo_path" value={formik.values.photo_path} />
              <input
                type="file"
                name="photo_file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0] ?? null;
                  setPhotoFile(file);
                }}
              />
            </label>
            <div />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">
              Ghi chú kỷ niệm
            </span>
            <textarea
              name="note"
              rows={4}
              value={formik.values.note}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ví dụ: Món quà đầu tiên sau chuyến đi Đà Lạt, vẫn còn giữ hộp quà và tấm thiệp."
            />
          </label>

          {formik.status ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">{String(formik.status)}</p>
          ) : null}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-fit rounded-xl bg-mocha px-4 py-2 text-sm text-white transition hover:opacity-95 disabled:opacity-60 dark:bg-white dark:text-[#1e1a1c] dark:hover:bg-white/90"
          >
            {formik.isSubmitting
              ? isEditing
                ? "Đang cập nhật..."
                : "Đang thêm..."
              : isEditing
                ? "Cập nhật kỷ niệm quà"
                : "Thêm kỷ niệm quà"}
          </button>
        </form>
      )}
    </Formik>
  );
}

