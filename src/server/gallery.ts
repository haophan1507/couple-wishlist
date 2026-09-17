import { requireAdminServer } from "@/lib/auth/require-admin-server";
import { deleteStorageFile } from "@/lib/storage/delete";
import { uploadImageFile } from "@/lib/storage/upload";
import { getOptionalFile } from "@/lib/storage/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { gallerySchema } from "@/lib/validation";
import { createServerFn } from "@tanstack/react-start";
import { formDataValidator } from "@/src/server/form-data";

export const upsertGalleryItemFn = createServerFn({ method: "POST" })
  .validator(formDataValidator)
  .handler(async ({ data: formData }) => {
    await requireAdminServer();
    const id = String(formData.get("id") ?? "");
    const imageFile = getOptionalFile(formData, "image_file");

    const parsed = gallerySchema.safeParse({
      caption: formData.get("caption"),
      memory_date: formData.get("memory_date"),
      existing_image_path: formData.get("existing_image_path"),
    });

    if (!parsed.success) {
      throw new Error("Dữ liệu ảnh kỷ niệm không hợp lệ.");
    }

    const supabase = createSupabaseAdminClient();
    const { data: existing } = id
      ? await supabase.from("gallery_items").select("image_path").eq("id", id).maybeSingle()
      : { data: null };

    const existingPath = (existing as { image_path: string | null } | null)?.image_path;
    let nextImagePath = parsed.data.existing_image_path || existingPath || null;

    if (imageFile) {
      const uploaded = await uploadImageFile({
        file: imageFile,
        target: "gallery",
        entityId: id || undefined,
      });
      nextImagePath = uploaded.path;
    }

    if (!nextImagePath) {
      throw new Error("Gallery image is required.");
    }

    const payload = {
      image_path: nextImagePath,
      image_alt: parsed.data.caption || "Ảnh kỷ niệm",
      caption: parsed.data.caption || null,
      memory_date: parsed.data.memory_date || null,
    };

    if (id) {
      const { error } = await supabase.from("gallery_items").update(payload).eq("id", id);
      if (error) throw new Error(`Cập nhật ảnh kỷ niệm thất bại: ${error.message}`);
    } else {
      const { error } = await supabase.from("gallery_items").insert(payload);
      if (error) throw new Error(`Thêm ảnh kỷ niệm thất bại: ${error.message}`);
    }

    if (imageFile && existingPath && existingPath !== nextImagePath) {
      await deleteStorageFile(existingPath);
    }

    return { ok: true as const };
  });

export const deleteGalleryItemFn = createServerFn({ method: "POST" })
  .validator(formDataValidator)
  .handler(async ({ data: formData }) => {
    await requireAdminServer();
    const id = String(formData.get("id") ?? "");
    const supabase = createSupabaseAdminClient();
    const { data: existing, error } = await supabase
      .from("gallery_items")
      .delete()
      .eq("id", id)
      .select("image_path")
      .maybeSingle();

    if (error) throw new Error(`Xóa ảnh kỷ niệm thất bại: ${error.message}`);
    await deleteStorageFile((existing as { image_path: string | null } | null)?.image_path);
    return { ok: true as const };
  });
