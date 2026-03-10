"use client";

import { useMemo, useState } from "react";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { upsertWishlistItemAction } from "@/app/actions/wishlist";
import { WISHLIST_CATEGORY_OPTIONS } from "@/lib/constants/wishlist";

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

export function WishlistForm({
  item = defaultValues,
  personOneName,
  personTwoName,
}: WishlistFormProps) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEditing = Boolean(item.id);
  const initialValues = useMemo(() => createInitialValues(item), [item]);

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        const formData = new FormData();
        formData.set("id", values.id ?? "");
        formData.set("owner_type", values.owner_type);
        formData.set("title", values.title.trim());
        formData.set("description", values.description.trim());
        formData.set("existing_image_path", values.image_path ?? "");
        formData.set("product_urls", values.product_urls.trim());
        formData.set("price_min", values.price_min.trim());
        formData.set("price_max", values.price_max.trim());
        formData.set("category_preset", values.category_preset);
        formData.set("category_custom", values.category_custom.trim());
        formData.set("priority", values.priority);
        formData.set("note", values.note.trim());
        formData.set("status", values.status);

        if (imageFile) {
          formData.set("image_file", imageFile);
        }

        try {
          await upsertWishlistItemAction(formData);
          setImageFile(null);
          router.refresh();
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
          className="grid gap-2 rounded-2xl border border-mocha/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <input type="hidden" name="id" value={formik.values.id ?? ""} />

          <div className="grid gap-2 md:grid-cols-2">
            <select
              name="owner_type"
              value={formik.values.owner_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="me">Quà cho {personOneName}</option>
              <option value="honey">Quà cho {personTwoName}</option>
            </select>
            <input
              name="title"
              placeholder="Tiêu đề"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
          </div>

          <textarea
            name="description"
            rows={2}
            placeholder="Mô tả"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <div className="grid gap-2 md:grid-cols-2">
            <input type="hidden" name="existing_image_path" value={formik.values.image_path ?? ""} />
            <input
              type="file"
              name="image_file"
              accept="image/*"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;
                setImageFile(file);
              }}
            />
            <textarea
              name="product_urls"
              rows={3}
              placeholder="Mỗi dòng là một link sản phẩm (https://...)"
              value={formik.values.product_urls}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <input
              name="price_min"
              type="number"
              placeholder="Giá thấp nhất"
              value={formik.values.price_min}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <input
              name="price_max"
              type="number"
              placeholder="Giá cao nhất"
              value={formik.values.price_max}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-2">
              <span className="block text-xs font-medium text-mocha/65 dark:text-white/50">
                Danh mục quà
              </span>
              <select
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
              </select>
              {formik.values.category_preset === "other" ? (
                <input
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
            </div>

            <label className="space-y-2">
              <span className="block text-xs font-medium text-mocha/65 dark:text-white/50">
                Mức độ mong muốn
              </span>
              <select
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="low">Bình thường</option>
                <option value="medium">Muốn sớm</option>
                <option value="high">Rất muốn</option>
              </select>
            </label>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_180px]">
            <textarea
              name="note"
              rows={2}
              placeholder="Ghi chú"
              value={formik.values.note}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="available">Có sẵn</option>
              <option value="gifted">Đã tặng</option>
            </select>
          </div>

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
                ? "Cập nhật"
                : "Thêm món"}
          </button>
        </form>
      )}
    </Formik>
  );
}

