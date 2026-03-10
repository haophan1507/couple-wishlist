"use client";

import { useState } from "react";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { upsertGalleryItemAction } from "@/app/actions/gallery";

type GalleryFormValues = {
  id: string;
  image_path: string;
  caption: string;
  memory_date: string;
};

const defaultValues: GalleryFormValues = {
  id: "",
  image_path: "",
  caption: "",
  memory_date: "",
};

export function GalleryForm({
  item = defaultValues,
}: {
  item?: GalleryFormValues;
}) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEditing = Boolean(item.id);

  return (
    <Formik<GalleryFormValues>
      initialValues={item}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        const formData = new FormData();
        formData.set("id", values.id ?? "");
        formData.set("existing_image_path", values.image_path ?? "");
        formData.set("caption", values.caption.trim());
        formData.set("memory_date", values.memory_date);

        if (imageFile) {
          formData.set("image_file", imageFile);
        }

        try {
          await upsertGalleryItemAction(formData);
          setImageFile(null);
          router.refresh();
          if (!isEditing) {
            helpers.resetForm();
          }
        } catch (error) {
          helpers.setStatus(error instanceof Error ? error.message : "Không thể lưu ảnh.");
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
          <input
            name="caption"
            placeholder="Chú thích"
            value={formik.values.caption}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <input
            name="memory_date"
            type="date"
            value={formik.values.memory_date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
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
                : "Thêm ảnh"}
          </button>
        </form>
      )}
    </Formik>
  );
}

