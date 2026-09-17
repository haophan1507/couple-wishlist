"use client";

import { useMemo, useRef } from "react";
import { Formik } from "formik";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { WISHLIST_CATEGORY_OPTIONS } from "@/lib/constants/wishlist";
import { upsertWishlistItemFn } from "@/src/server/wishlist";

type WishlistFormItem = {
  id: string;
  owner_type: string;
  title: string;
  description: string;
  image_path: string;
  product_urls: string;
  price_min: string;
  price_max: string;
  category: string;
  priority: string;
  note: string;
  status: string;
};

const defaultValues: WishlistFormItem = {
  id: "",
  owner_type: "me",
  title: "",
  description: "",
  image_path: "",
  product_urls: "",
  price_min: "",
  price_max: "",
  category: "",
  priority: "medium",
  note: "",
  status: "available",
};

type WishlistFormProps = {
  item?: WishlistFormItem;
  personOneName: string;
  personTwoName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormValues = WishlistFormItem & {
  category_preset: string;
  category_custom: string;
};

function createInitialValues(item: WishlistFormItem): FormValues {
  const category = item.category ?? "";
  const isPreset = WISHLIST_CATEGORY_OPTIONS.includes(
    category as (typeof WISHLIST_CATEGORY_OPTIONS)[number],
  );

  return {
    ...item,
    category_preset: isPreset ? category : category ? "other" : "",
    category_custom: isPreset ? "" : category,
  };
}

function toTrimmedString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function WishlistForm({
  item = defaultValues,
  personOneName,
  personTwoName,
  onSuccess,
  onCancel,
}: WishlistFormProps) {
  const imageFileRef = useRef<File | null>(null);
  const isEditing = Boolean(item.id);
  const initialValues = useMemo(() => createInitialValues(item), [item]);

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        const formData = new FormData();
        formData.set("id", toTrimmedString(values.id));
        formData.set("owner_type", values.owner_type);
        formData.set("title", toTrimmedString(values.title));
        formData.set("description", toTrimmedString(values.description));
        formData.set("existing_image_path", toTrimmedString(values.image_path));
        formData.set("product_urls", toTrimmedString(values.product_urls));
        formData.set("price_min", toTrimmedString(values.price_min));
        formData.set("price_max", toTrimmedString(values.price_max));
        formData.set("category_preset", values.category_preset);
        formData.set("category_custom", toTrimmedString(values.category_custom));
        formData.set("priority", values.priority);
        formData.set("note", toTrimmedString(values.note));
        formData.set("status", values.status);

        if (imageFileRef.current) {
          formData.set("image_file", imageFileRef.current);
        }

        try {
          await upsertWishlistItemFn({ data: formData });
          imageFileRef.current = null;
          helpers.setStatus(undefined);
          onSuccess?.();
          if (!isEditing) {
            helpers.resetForm();
          }
        } catch (error) {
          helpers.setStatus(
            error instanceof Error ? error.message : "Không thể lưu món quà lúc này.",
          );
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
          <input type="hidden" name="id" value={formik.values.id ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <NativeSelect
              name="owner_type"
              aria-label="Người nhận quà"
              value={formik.values.owner_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="me">Quà cho {personOneName}</option>
              <option value="honey">Quà cho {personTwoName}</option>
            </NativeSelect>
            <Input
              name="title"
              placeholder="Tiêu đề"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
          </div>

          <Textarea
            name="description"
            rows={2}
            placeholder="Mô tả"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <AdminImagePreview path={item.image_path || null} alt={item.title || "Ảnh wishlist"} />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="hidden"
              name="existing_image_path"
              value={formik.values.image_path ?? ""}
            />
            <Input
              type="file"
              name="image_file"
              accept="image/*"
              aria-label="Ảnh sản phẩm"
              onChange={(event) => {
                imageFileRef.current = event.currentTarget.files?.[0] ?? null;
              }}
            />
            <Textarea
              name="product_urls"
              rows={3}
              placeholder="Link sản phẩm (không bắt buộc, mỗi dòng một link https://...)"
              value={formik.values.product_urls}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              name="price_min"
              type="number"
              placeholder="Giá thấp nhất"
              value={formik.values.price_min}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <Input
              name="price_max"
              type="number"
              placeholder="Giá cao nhất"
              value={formik.values.price_max}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-foreground/80">Danh mục quà</span>
              <NativeSelect
                name="category_preset"
                value={formik.values.category_preset}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Chọn danh mục</option>
                {WISHLIST_CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value="other">Khác (tự nhập)</option>
              </NativeSelect>
              {formik.values.category_preset === "other" ? (
                <Input
                  name="category_custom"
                  placeholder="Nhập danh mục riêng"
                  value={formik.values.category_custom}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
              ) : (
                <input type="hidden" name="category_custom" value="" />
              )}
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-foreground/80">Mức độ ưu tiên</span>
              <NativeSelect
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="low">Ưu tiên thấp</option>
                <option value="medium">Ưu tiên trung bình</option>
                <option value="high">Ưu tiên cao</option>
              </NativeSelect>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <Textarea
              name="note"
              rows={2}
              placeholder="Ghi chú"
              value={formik.values.note}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <NativeSelect
              name="status"
              aria-label="Trạng thái wishlist"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="available">Có sẵn</option>
              <option value="gifted">Đã tặng</option>
            </NativeSelect>
          </div>

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
                  ? "Cập nhật"
                  : "Thêm món"}
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
