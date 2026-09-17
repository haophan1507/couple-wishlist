"use client";

import { useRef } from "react";
import { Formik } from "formik";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { upsertGalleryItemFn } from "@/src/server/gallery";

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
  onSuccess,
  onCancel,
}: {
  item?: GalleryFormValues;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const imageFileRef = useRef<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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

        if (imageFileRef.current) {
          formData.set("image_file", imageFileRef.current);
        }

        try {
          await upsertGalleryItemFn({ data: formData });
          imageFileRef.current = null;
          if (imageInputRef.current) {
            imageInputRef.current.value = "";
          }
          onSuccess?.();
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
          className="grid gap-4 rounded-2xl border border-border bg-card/60 p-4"
        >
          <input type="hidden" name="id" value={formik.values.id ?? ""} />
          <input type="hidden" name="existing_image_path" value={formik.values.image_path ?? ""} />
          <FormField label="Ảnh kỷ niệm">
            <AdminImagePreview path={item.image_path || null} alt={item.caption || "Ảnh kỷ niệm"} />
            <Input
              ref={imageInputRef}
              type="file"
              name="image_file"
              accept="image/*"
              className="mt-2"
              onChange={(event) => {
                imageFileRef.current = event.currentTarget.files?.[0] ?? null;
              }}
            />
          </FormField>
          <FormField label="Chú thích">
            <Input
              name="caption"
              placeholder="Chú thích"
              value={formik.values.caption}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormField>
          <FormField label="Ngày kỷ niệm">
            <Input
              name="memory_date"
              type="date"
              value={formik.values.memory_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
                  ? "Cập nhật"
                  : "Thêm ảnh"}
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
