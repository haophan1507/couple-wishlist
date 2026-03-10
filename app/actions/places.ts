"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { deleteStorageFile } from "@/lib/storage/delete";
import { uploadImageFile } from "@/lib/storage/upload";
import { getOptionalFile, validateImageFile } from "@/lib/storage/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { placeMemorySchema } from "@/lib/validation";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function splitLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function upsertPlaceMemoryAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const coverFile = getOptionalFile(formData, "cover_image_file");
  const galleryFiles = formData
    .getAll("gallery_image_files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const parsed = placeMemorySchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    status: formData.get("status"),
    visit_date: formData.get("visit_date"),
    location_name: formData.get("location_name"),
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
    city: formData.get("city"),
    country: formData.get("country"),
    existing_cover_image_path: formData.get("existing_cover_image_path"),
    gallery_captions: formData.get("gallery_captions"),
  });

  if (!parsed.success) {
    throw new Error("Dữ liệu địa điểm không hợp lệ.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing } = id
    ? await supabase
        .from("place_memories")
        .select("cover_image_path")
        .eq("id", id)
        .maybeSingle()
    : { data: null };

  let nextCoverImagePath =
    parsed.data.existing_cover_image_path || existing?.cover_image_path || null;

  if (coverFile) {
    const uploaded = await uploadImageFile({
      file: coverFile,
      target: "placeCover",
      entityId: id || undefined,
    });
    nextCoverImagePath = uploaded.path;
  }

  const payload = {
    title: parsed.data.title,
    slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title),
    description: parsed.data.description || null,
    status: parsed.data.status,
    visit_date: parsed.data.visit_date || null,
    location_name: parsed.data.location_name,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    city: parsed.data.city || null,
    country: parsed.data.country || null,
    cover_image_path: nextCoverImagePath,
    cover_image_alt: parsed.data.title,
    updated_at: new Date().toISOString(),
  };

  let placeId = id;
  if (id) {
    await supabase.from("place_memories").update(payload).eq("id", id);
  } else {
    const { data: inserted, error } = await supabase
      .from("place_memories")
      .insert(payload)
      .select("id")
      .single();

    if (error || !inserted) {
      throw new Error("Không thể tạo địa điểm mới.");
    }

    placeId = inserted.id;
  }

  if (coverFile && existing?.cover_image_path && existing.cover_image_path !== nextCoverImagePath) {
    await deleteStorageFile(existing.cover_image_path);
  }

  if (galleryFiles.length) {
    for (const file of galleryFiles) {
      validateImageFile(file, "placeGallery");
    }

    const { data: existingImages } = await supabase
      .from("place_memory_images")
      .select("id, image_path")
      .eq("place_memory_id", placeId);

    const captions = splitLines(formData.get("gallery_captions"));
    const uploadedImages = await Promise.all(
      galleryFiles.map((file, index) =>
        uploadImageFile({
          file,
          target: "placeGallery",
          entityId: placeId,
        }).then((uploaded) => ({
          place_memory_id: placeId,
          image_path: uploaded.path,
          image_alt: captions[index] || payload.title,
          caption: captions[index] || null,
          sort_order: index,
        })),
      ),
    );

    await supabase.from("place_memory_images").delete().eq("place_memory_id", placeId);
    await supabase.from("place_memory_images").insert(uploadedImages);

    for (const image of existingImages ?? []) {
      await deleteStorageFile(image.image_path);
    }
  }

  revalidatePath("/heart-mapping");
  revalidatePath("/admin/places");

  if (!id) {
    redirect("/admin/places?created=1");
  }
}

export async function deletePlaceMemoryAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const [{ data: place }, { data: images }] = await Promise.all([
    supabase.from("place_memories").select("cover_image_path").eq("id", id).maybeSingle(),
    supabase.from("place_memory_images").select("image_path").eq("place_memory_id", id),
  ]);

  await supabase.from("place_memories").delete().eq("id", id);

  await deleteStorageFile(place?.cover_image_path);
  for (const image of images ?? []) {
    await deleteStorageFile(image.image_path);
  }

  revalidatePath("/heart-mapping");
  revalidatePath("/admin/places");
}
