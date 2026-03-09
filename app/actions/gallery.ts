"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { gallerySchema } from "@/lib/validation";

async function uploadFileIfProvided(formData: FormData) {
  const file = formData.get("image_file");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `gallery/${randomUUID()}.${ext}`;
  const supabase = createSupabaseAdminClient();

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("couple-assets").upload(filePath, buffer, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    throw new Error("Failed to upload image.");
  }

  const { data } = supabase.storage.from("couple-assets").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function upsertGalleryItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const uploadedUrl = await uploadFileIfProvided(formData);

  const parsed = gallerySchema.safeParse({
    caption: formData.get("caption"),
    memory_date: formData.get("memory_date"),
    image_url: uploadedUrl || formData.get("image_url")
  });

  if (!parsed.success || !parsed.data.image_url) {
    throw new Error("Invalid gallery form data");
  }

  const payload = {
    image_url: parsed.data.image_url,
    caption: parsed.data.caption || null,
    memory_date: parsed.data.memory_date || null
  };

  const supabase = createSupabaseAdminClient();

  if (id) {
    await supabase.from("gallery_items").update(payload).eq("id", id);
  } else {
    await supabase.from("gallery_items").insert(payload);
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  await supabase.from("gallery_items").delete().eq("id", id);

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}
