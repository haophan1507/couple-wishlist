import { requireAdminServer } from "@/lib/auth/require-admin-server";
import { deleteStorageFile } from "@/lib/storage/delete";
import { uploadImageFile } from "@/lib/storage/upload";
import { getOptionalFile } from "@/lib/storage/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { coupleProfileSchema } from "@/lib/validation";
import { createFormDataServerFn } from "@/src/server/form-data";

export const upsertCoupleProfileFn = createFormDataServerFn().handler(
  async ({ data: formData }) => {
    await requireAdminServer();
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
      existing_cover_image_path: formData.get("existing_cover_image_path"),
    });

    if (!parsed.success) {
      throw new Error("Dữ liệu hồ sơ không hợp lệ.");
    }

    const supabase = createSupabaseAdminClient();
    const { data: existing } = await supabase
      .from("couple_profile")
      .select("id, cover_image_path")
      .limit(1)
      .maybeSingle();

    const existingRow = existing as {
      id: string;
      cover_image_path: string | null;
    } | null;

    let nextCoverImagePath =
      parsed.data.existing_cover_image_path ||
      existingRow?.cover_image_path ||
      null;

    if (coverFile) {
      const uploaded = await uploadImageFile({
        file: coverFile,
        target: "cover",
        entityId: existingRow?.id,
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
      cover_image_alt: "Ảnh bìa cặp đôi",
      updated_at: new Date().toISOString(),
    };

    if (existingRow) {
      const { error } = await supabase
        .from("couple_profile")
        .update(payload)
        .eq("id", existingRow.id);
      if (error) throw new Error(`Cập nhật hồ sơ thất bại: ${error.message}`);
    } else {
      const { error } = await supabase.from("couple_profile").insert(payload);
      if (error) throw new Error(`Tạo hồ sơ thất bại: ${error.message}`);
    }

    if (
      coverFile &&
      existingRow?.cover_image_path &&
      existingRow.cover_image_path !== nextCoverImagePath
    ) {
      await deleteStorageFile(existingRow.cover_image_path);
    }

    return { ok: true as const };
  },
);
