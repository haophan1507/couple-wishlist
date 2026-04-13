"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteStorageFile } from "@/lib/storage/delete";
import { uploadImageFile } from "@/lib/storage/upload";
import { getOptionalFile } from "@/lib/storage/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidHttpUrl, joinWishlistProductUrls, parseWishlistProductUrls } from "@/lib/utils/wishlist-links";
import { wishlistSchema } from "@/lib/validation";

function normalizeTextField(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalNumberField(value: FormDataEntryValue | null) {
  const normalized = normalizeTextField(value);
  return normalized ? normalized : undefined;
}

export async function upsertWishlistItemAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const imageFile = getOptionalFile(formData, "image_file");
  const productUrlsRaw = normalizeTextField(formData.get("product_urls") ?? formData.get("product_url"));
  const parsedProductUrls = parseWishlistProductUrls(productUrlsRaw);
  const validProductUrls = parsedProductUrls.filter((url) => isValidHttpUrl(url));
  const categoryPreset = normalizeTextField(formData.get("category_preset"));
  const categoryCustom = normalizeTextField(formData.get("category_custom"));
  const categoryValue =
    categoryPreset === "other" ? categoryCustom : categoryPreset;

  if (categoryPreset === "other" && !categoryCustom) {
    throw new Error("Vui lòng nhập danh mục khi chọn Khác.");
  }

  const parsed = wishlistSchema.safeParse({
    owner_type: formData.get("owner_type"),
    title: normalizeTextField(formData.get("title")),
    description: normalizeTextField(formData.get("description")),
    existing_image_path: normalizeTextField(formData.get("existing_image_path")),
    product_urls: productUrlsRaw,
    price_min: normalizeOptionalNumberField(formData.get("price_min")),
    price_max: normalizeOptionalNumberField(formData.get("price_max")),
    category: categoryValue || undefined,
    priority: formData.get("priority"),
    note: normalizeTextField(formData.get("note")),
    status: formData.get("status")
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new Error(firstIssue?.message || "Dữ liệu món quà không hợp lệ.");
  }

  if (parsedProductUrls.length > 1 && validProductUrls.length !== parsedProductUrls.length) {
    throw new Error("Danh sách link sản phẩm có dòng không hợp lệ. Bạn có thể để trống hoặc chỉ nhập link bắt đầu bằng http/https.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = id
    ? await supabase.from("wishlist_items").select("image_path").eq("id", id).maybeSingle()
    : { data: null, error: null };

  if (existingError) {
    throw new Error("Không thể đọc dữ liệu món quà hiện tại.");
  }

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
    product_url: joinWishlistProductUrls(validProductUrls) || null,
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
    const { error } = await supabase.from("wishlist_items").update(payload).eq("id", id);

    if (error) {
      throw new Error(`Cập nhật món quà thất bại: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("wishlist_items").insert(payload);

    if (error) {
      throw new Error(`Thêm món quà thất bại: ${error.message}`);
    }
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
