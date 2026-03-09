"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteStorageFile } from "@/lib/storage/delete";
import { uploadImageFile } from "@/lib/storage/upload";
import { getOptionalFile } from "@/lib/storage/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { gallerySchema } from "@/lib/validation";

export async function upsertGalleryItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const imageFile = getOptionalFile(formData, "image_file");

  const parsed = gallerySchema.safeParse({
    caption: formData.get("caption"),
    memory_date: formData.get("memory_date"),
    existing_image_path: formData.get("existing_image_path")
  });

  if (!parsed.success) {
    throw new Error("Invalid gallery form data");
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing } = id
    ? await supabase.from("gallery_items").select("image_path").eq("id", id).maybeSingle()
    : { data: null };
  let nextImagePath = parsed.data.existing_image_path || existing?.image_path || null;

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
    memory_date: parsed.data.memory_date || null
  };

  if (id) {
    await supabase.from("gallery_items").update(payload).eq("id", id);
  } else {
    await supabase.from("gallery_items").insert(payload);
  }

  if (imageFile && existing?.image_path && existing.image_path !== nextImagePath) {
    await deleteStorageFile(existing.image_path);
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("gallery_items")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("gallery_items").delete().eq("id", id);

  await deleteStorageFile(existing?.image_path);

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}
