"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteStorageFile } from "@/lib/storage/delete";
import { uploadImageFile } from "@/lib/storage/upload";
import { getOptionalFile } from "@/lib/storage/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { coupleProfileSchema } from "@/lib/validation";

export async function upsertCoupleProfileAction(formData: FormData) {
  await requireAdmin();
  const coverFile = getOptionalFile(formData, "cover_image_file");

  const parsed = coupleProfileSchema.safeParse({
    person_one_name: formData.get("person_one_name"),
    person_two_name: formData.get("person_two_name"),
    love_start_date: formData.get("love_start_date"),
    person_one_birthday: formData.get("person_one_birthday"),
    person_two_birthday: formData.get("person_two_birthday"),
    person_one_favorite: formData.get("person_one_favorite"),
    person_two_favorite: formData.get("person_two_favorite"),
    person_one_hobby: formData.get("person_one_hobby"),
    person_two_hobby: formData.get("person_two_hobby"),
    story: formData.get("story"),
    cover_image_alt: formData.get("cover_image_alt"),
    existing_cover_image_path: formData.get("existing_cover_image_path")
  });

  if (!parsed.success) {
    throw new Error("Invalid profile data");
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("couple_profile")
    .select("id, cover_image_path")
    .limit(1)
    .maybeSingle();
  let nextCoverImagePath = parsed.data.existing_cover_image_path || existing?.cover_image_path || null;

  if (coverFile) {
    const uploaded = await uploadImageFile({
      file: coverFile,
      target: "cover",
      entityId: existing?.id,
    });
    nextCoverImagePath = uploaded.path;
  }

  const payload = {
    person_one_name: parsed.data.person_one_name,
    person_two_name: parsed.data.person_two_name,
    love_start_date: parsed.data.love_start_date || null,
    person_one_birthday: parsed.data.person_one_birthday || null,
    person_two_birthday: parsed.data.person_two_birthday || null,
    person_one_favorite: parsed.data.person_one_favorite || null,
    person_two_favorite: parsed.data.person_two_favorite || null,
    person_one_hobby: parsed.data.person_one_hobby || null,
    person_two_hobby: parsed.data.person_two_hobby || null,
    story: parsed.data.story || null,
    cover_image_path: nextCoverImagePath,
    cover_image_alt: parsed.data.cover_image_alt || null,
    updated_at: new Date().toISOString()
  };

  if (existing) {
    await supabase.from("couple_profile").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("couple_profile").insert(payload);
  }

  if (coverFile && existing?.cover_image_path && existing.cover_image_path !== nextCoverImagePath) {
    await deleteStorageFile(existing.cover_image_path);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}
