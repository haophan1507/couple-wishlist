"use client";

import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { upsertSpecialDayAction } from "@/app/actions/special-days";

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
}: {
  item?: SpecialDayFormValues;
}) {
  const router = useRouter();
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
          await upsertSpecialDayAction(formData);
          router.refresh();
          if (!isEditing) {
            helpers.resetForm();
          }
        } catch (error) {
          helpers.setStatus(error instanceof Error ? error.message : "Không thể lưu ngày đặc biệt.");
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
          <input
            name="title"
            placeholder="Tiêu đề"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
          />
          <textarea
            name="description"
            rows={2}
            placeholder="Mô tả"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <input
              name="date"
              type="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            <select
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
                : "Thêm ngày"}
          </button>
        </form>
      )}
    </Formik>
  );
}

