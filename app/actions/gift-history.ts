"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteStorageFile } from "@/lib/storage/delete";
import { uploadImageFile } from "@/lib/storage/upload";
import { getOptionalFile } from "@/lib/storage/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { giftHistorySchema } from "@/lib/validation";

export async function upsertGiftHistoryItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const photoFile = getOptionalFile(formData, "photo_file");
  const parsed = giftHistorySchema.safeParse({
    recipient_owner_type: formData.get("recipient_owner_type"),
    gift_name: formData.get("gift_name"),
    giver_name: formData.get("giver_name"),
    received_date: formData.get("received_date"),
    special_day_id: formData.get("special_day_id"),
    note: formData.get("note"),
    photo_alt: formData.get("photo_alt"),
    existing_photo_path: formData.get("existing_photo_path"),
    wishlist_item_id: formData.get("wishlist_item_id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error("Dữ liệu lịch sử quà tặng không hợp lệ.");
  }

  const payload = {
    recipient_owner_type: parsed.data.recipient_owner_type,
    gift_name: parsed.data.gift_name,
    giver_name: parsed.data.giver_name,
    received_date: parsed.data.received_date,
    special_day_id: parsed.data.special_day_id || null,
    note: parsed.data.note || null,
    wishlist_item_id: parsed.data.wishlist_item_id || null,
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };

  const supabase = createSupabaseAdminClient();
  let wishlistItemTitle: string | null = null;
  const { data: existing } = id
    ? await supabase
        .from("gift_history_items")
        .select("wishlist_item_title, photo_path")
        .eq("id", id)
        .maybeSingle()
    : { data: null };
  let nextPhotoPath = parsed.data.existing_photo_path || existing?.photo_path || null;

  wishlistItemTitle = existing?.wishlist_item_title ?? null;

  if (payload.wishlist_item_id) {
    const { data: wishlistItem } = await supabase
      .from("wishlist_items")
      .select("id, title")
      .eq("id", payload.wishlist_item_id)
      .maybeSingle();

    wishlistItemTitle = wishlistItem?.title ?? wishlistItemTitle;
  }

  if (photoFile) {
    const uploaded = await uploadImageFile({
      file: photoFile,
      target: "giftHistory",
      entityId: id || undefined,
    });
    nextPhotoPath = uploaded.path;
  }

  const finalPayload = {
    ...payload,
    photo_path: nextPhotoPath,
    photo_alt: parsed.data.photo_alt || parsed.data.gift_name,
    wishlist_item_title: wishlistItemTitle,
  };

  if (id) {
    await supabase.from("gift_history_items").update(finalPayload).eq("id", id);
  } else {
    await supabase.from("gift_history_items").insert(finalPayload);
  }

  if (payload.wishlist_item_id) {
    await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", payload.wishlist_item_id);
  }

  if (photoFile && existing?.photo_path && existing.photo_path !== nextPhotoPath) {
    await deleteStorageFile(existing.photo_path);
  }

  revalidatePath("/gift-history");
  revalidatePath("/admin");
  revalidatePath("/admin/gift-history");
  revalidatePath("/wishlist");
  revalidatePath("/admin/wishlist");
  revalidatePath("/");
}

export async function deleteGiftHistoryItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("gift_history_items")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("gift_history_items").delete().eq("id", id);
  await deleteStorageFile(existing?.photo_path);

  revalidatePath("/gift-history");
  revalidatePath("/admin");
  revalidatePath("/admin/gift-history");
}
