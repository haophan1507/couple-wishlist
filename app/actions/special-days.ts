"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { specialDaySchema } from "@/lib/validation";

export async function upsertSpecialDayAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = specialDaySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    type: formData.get("type")
  });

  if (!parsed.success) {
    throw new Error("Invalid special day form data");
  }

  const payload = {
    ...parsed.data,
    description: parsed.data.description || null
  };

  const supabase = createSupabaseAdminClient();

  if (id) {
    await supabase.from("special_days").update(payload).eq("id", id);
  } else {
    await supabase.from("special_days").insert(payload);
  }

  revalidatePath("/special-days");
  revalidatePath("/");
  revalidatePath("/admin/special-days");
}

export async function deleteSpecialDayAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  await supabase.from("special_days").delete().eq("id", id);

  revalidatePath("/special-days");
  revalidatePath("/");
  revalidatePath("/admin/special-days");
}
