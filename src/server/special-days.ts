import { requireAdminServer } from "@/lib/auth/require-admin-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { specialDaySchema } from "@/lib/validation";
import { createServerFn } from "@tanstack/react-start";
import { formDataValidator } from "@/src/server/form-data";

export const upsertSpecialDayFn = createServerFn({ method: "POST" })
  .validator(formDataValidator)
  .handler(async ({ data: formData }) => {
    await requireAdminServer();

    const id = String(formData.get("id") ?? "");
    const parsed = specialDaySchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      type: formData.get("type"),
    });

    if (!parsed.success) {
      throw new Error("Dữ liệu ngày đặc biệt không hợp lệ.");
    }

    const payload = {
      ...parsed.data,
      description: parsed.data.description || null,
    };

    const supabase = createSupabaseAdminClient();

    if (id) {
      const { error } = await supabase.from("special_days").update(payload).eq("id", id);
      if (error) throw new Error(`Cập nhật ngày đặc biệt thất bại: ${error.message}`);
    } else {
      const { error } = await supabase.from("special_days").insert(payload);
      if (error) throw new Error(`Thêm ngày đặc biệt thất bại: ${error.message}`);
    }

    return { ok: true as const };
  });

export const deleteSpecialDayFn = createServerFn({ method: "POST" })
  .validator(formDataValidator)
  .handler(async ({ data: formData }) => {
    await requireAdminServer();
    const id = String(formData.get("id") ?? "");
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("special_days").delete().eq("id", id);
    if (error) throw new Error(`Xóa ngày đặc biệt thất bại: ${error.message}`);
    return { ok: true as const };
  });
