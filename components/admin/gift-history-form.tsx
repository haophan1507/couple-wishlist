"use client";

import { useRef } from "react";
import { Formik } from "formik";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { upsertGiftHistoryItemFn } from "@/src/server/gift-history";

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
  onSuccess,
  onCancel,
}: {
  item?: GiftHistoryFormValues;
  personOneName: string;
  personTwoName: string;
  specialDays: Array<{ id: string; title: string }>;
  wishlistItems: Array<{ id: string; title: string; owner_type: "me" | "honey" }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const photoFileRef = useRef<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
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

        if (photoFileRef.current) {
          formData.set("photo_file", photoFileRef.current);
        }

        try {
          await upsertGiftHistoryItemFn({ data: formData });

          photoFileRef.current = null;
          if (photoInputRef.current) {
            photoInputRef.current.value = "";
          }
          onSuccess?.();
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
          className="grid gap-4 rounded-2xl border border-border bg-card/60 p-4"
        >
          <input type="hidden" name="id" value={formik.values.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Người nhận">
              <NativeSelect
                name="recipient_owner_type"
                value={formik.values.recipient_owner_type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="me">{personOneName}</option>
                <option value="honey">{personTwoName}</option>
              </NativeSelect>
            </FormField>
            <FormField label="Trạng thái">
              <NativeSelect
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="received">Đã nhận</option>
                <option value="thanked">Đã cảm ơn</option>
                <option value="archived">Lưu kỷ niệm</option>
              </NativeSelect>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Tên món quà">
              <Input
                name="gift_name"
                value={formik.values.gift_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ví dụ: Máy ảnh film bỏ túi"
                required
              />
            </FormField>
            <FormField label="Người tặng">
              <Input
                name="giver_name"
                value={formik.values.giver_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ví dụ: Trà"
                required
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Ngày nhận">
              <Input
                name="received_date"
                type="date"
                value={formik.values.received_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
            </FormField>
            <FormField label="Dịp đặc biệt">
              <NativeSelect
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
              </NativeSelect>
            </FormField>
          </div>

          <FormField label="Link tới wishlist gốc">
            <NativeSelect
              name="wishlist_item_id"
              value={formik.values.wishlist_item_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Không liên kết wishlist</option>
              {wishlistItems.map((wishlistItem) => (
                <option key={wishlistItem.id} value={wishlistItem.id}>
                  {wishlistItem.owner_type === "me" ? personOneName : personTwoName}:{" "}
                  {wishlistItem.title}
                </option>
              ))}
            </NativeSelect>
          </FormField>

          <FormField label="Ảnh kỷ niệm">
            <input type="hidden" name="existing_photo_path" value={formik.values.photo_path} />
            <AdminImagePreview
              path={item.photo_path || null}
              alt={item.gift_name || "Ảnh kỷ niệm quà"}
            />
            <Input
              ref={photoInputRef}
              type="file"
              name="photo_file"
              accept="image/*"
              className="mt-2"
              onChange={(event) => {
                photoFileRef.current = event.currentTarget.files?.[0] ?? null;
              }}
            />
          </FormField>

          <FormField label="Ghi chú kỷ niệm">
            <Textarea
              name="note"
              rows={4}
              value={formik.values.note}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ví dụ: Món quà đầu tiên sau chuyến đi Đà Lạt..."
            />
          </FormField>

          {formik.status ? (
            <p className="text-sm text-destructive">{String(formik.status)}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting
                ? isEditing
                  ? "Đang cập nhật..."
                  : "Đang thêm..."
                : isEditing
                  ? "Cập nhật kỷ niệm quà"
                  : "Thêm kỷ niệm quà"}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
            ) : null}
          </div>
        </form>
      )}
    </Formik>
  );
}
