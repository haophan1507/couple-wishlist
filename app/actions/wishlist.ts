"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteStorageFile } from "@/lib/storage/delete";
import { uploadImageFile } from "@/lib/storage/upload";
import { getOptionalFile } from "@/lib/storage/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidHttpUrl, joinWishlistProductUrls, parseWishlistProductUrls } from "@/lib/utils/wishlist-links";
import { wishlistSchema } from "@/lib/validation";

export async function upsertWishlistItemAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const imageFile = getOptionalFile(formData, "image_file");
  const productUrlsRaw = String(formData.get("product_urls") ?? formData.get("product_url") ?? "");
  const productUrls = parseWishlistProductUrls(productUrlsRaw);
  const categoryPreset = String(formData.get("category_preset") ?? "").trim();
  const categoryCustom = String(formData.get("category_custom") ?? "").trim();
  const categoryValue =
    categoryPreset === "other" ? categoryCustom : categoryPreset;

  if (categoryPreset === "other" && !categoryCustom) {
    throw new Error("Vui lòng nhập danh mục khi chọn Khác.");
  }

  const parsed = wishlistSchema.safeParse({
    owner_type: formData.get("owner_type"),
    title: formData.get("title"),
    description: formData.get("description"),
    existing_image_path: formData.get("existing_image_path"),
    product_urls: productUrlsRaw,
    price_min: formData.get("price_min") || undefined,
    price_max: formData.get("price_max") || undefined,
    category: categoryValue || undefined,
    priority: formData.get("priority"),
    note: formData.get("note"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error("Invalid wishlist form data");
  }

  if (productUrls.some((url) => !isValidHttpUrl(url))) {
    throw new Error("Một hoặc nhiều link sản phẩm không hợp lệ (chỉ hỗ trợ http/https).");
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing } = id
    ? await supabase.from("wishlist_items").select("image_path").eq("id", id).maybeSingle()
    : { data: null };
  let nextImagePath = parsed.data.existing_image_path || existing?.image_path || null;

  if (imageFile) {
    const uploaded = await uploadImageFile({
      file: imageFile,
      target: "wishlist",
      entityId: id || undefined,
    });
    nextImagePath = uploaded.path;
  }

  const payload = {
    owner_type: parsed.data.owner_type,
    title: parsed.data.title,
    image_path: nextImagePath,
    image_alt: parsed.data.title,
    product_url: joinWishlistProductUrls(productUrls) || null,
    category: parsed.data.category || null,
    note: parsed.data.note || null,
    description: parsed.data.description || null,
    price_min: parsed.data.price_min ?? null,
    price_max: parsed.data.price_max ?? null,
    priority: parsed.data.priority,
    status: parsed.data.status,
    updated_at: new Date().toISOString()
  };

  if (id) {
    await supabase.from("wishlist_items").update(payload).eq("id", id);
  } else {
    await supabase.from("wishlist_items").insert(payload);
  }

  if (imageFile && existing?.image_path && existing.image_path !== nextImagePath) {
    await deleteStorageFile(existing.image_path);
  }

  revalidatePath("/wishlist");
  revalidatePath("/");
  revalidatePath("/admin/wishlist");
}

export async function deleteWishlistItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("wishlist_items").delete().eq("id", id);
  await deleteStorageFile(existing?.image_path);

  revalidatePath("/wishlist");
  revalidatePath("/");
  revalidatePath("/admin/wishlist");
}
