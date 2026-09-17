"use client";

import { Formik } from "formik";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { upsertSpecialDayFn } from "@/src/server/special-days";

type SpecialDayFormValues = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
};

const defaultValues: SpecialDayFormValues = {
  id: "",
  title: "",
  description: "",
  date: "",
  type: "other",
};

export function SpecialDayForm({
  item = defaultValues,
  onSuccess,
  onCancel,
}: {
  item?: SpecialDayFormValues;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const isEditing = Boolean(item.id);

  return (
    <Formik<SpecialDayFormValues>
      initialValues={item}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        const formData = new FormData();
        formData.set("id", values.id ?? "");
        formData.set("title", values.title.trim());
        formData.set("description", values.description.trim());
        formData.set("date", values.date);
        formData.set("type", values.type);

        try {
          await upsertSpecialDayFn({ data: formData });
          onSuccess?.();
          if (!isEditing) {
            helpers.resetForm();
          }
        } catch (error) {
          helpers.setStatus(
            error instanceof Error ? error.message : "Không thể lưu ngày đặc biệt.",
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
          <FormField label="Tiêu đề">
            <Input
              name="title"
              placeholder="Tiêu đề"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
          </FormField>
          <FormField label="Mô tả">
            <Textarea
              name="description"
              rows={2}
              placeholder="Mô tả"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Ngày">
              <Input
                name="date"
                type="date"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
            </FormField>
            <FormField label="Loại ngày">
              <NativeSelect
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="birthday">Sinh nhật</option>
                <option value="anniversary">Kỷ niệm</option>
                <option value="relationship">Mốc yêu nhau</option>
                <option value="holiday">Ngày lễ</option>
                <option value="other">Khác</option>
              </NativeSelect>
            </FormField>
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
                  : "Thêm ngày"}
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
