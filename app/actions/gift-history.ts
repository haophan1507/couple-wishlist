"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { giftHistorySchema } from "@/lib/validation";

async function uploadGiftPhotoIfProvided(formData: FormData) {
  const file = formData.get("photo_file");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `gift-history/${randomUUID()}.${ext}`;
  const supabase = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("couple-assets")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error("Không thể tải ảnh quà tặng.");
  }

  const { data } = supabase.storage.from("couple-assets").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function upsertGiftHistoryItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const uploadedUrl = await uploadGiftPhotoIfProvided(formData);
  const parsed = giftHistorySchema.safeParse({
    recipient_owner_type: formData.get("recipient_owner_type"),
    gift_name: formData.get("gift_name"),
    giver_name: formData.get("giver_name"),
    received_date: formData.get("received_date"),
    special_day_id: formData.get("special_day_id"),
    note: formData.get("note"),
    photo_url: uploadedUrl || formData.get("photo_url"),
    wishlist_item_id: formData.get("wishlist_item_id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error("Dữ liệu lịch sử quà tặng không hợp lệ.");
  }

  const payload = {
    ...parsed.data,
    special_day_id: parsed.data.special_day_id || null,
    note: parsed.data.note || null,
    photo_url: parsed.data.photo_url || null,
    wishlist_item_id: parsed.data.wishlist_item_id || null,
    updated_at: new Date().toISOString(),
  };

  const supabase = createSupabaseAdminClient();
  let wishlistItemTitle: string | null = null;

  if (id) {
    const { data: existing } = await supabase
      .from("gift_history_items")
      .select("wishlist_item_title")
      .eq("id", id)
      .maybeSingle();

    wishlistItemTitle = existing?.wishlist_item_title ?? null;
  }

  if (payload.wishlist_item_id) {
    const { data: wishlistItem } = await supabase
      .from("wishlist_items")
      .select("id, title")
      .eq("id", payload.wishlist_item_id)
      .maybeSingle();

    wishlistItemTitle = wishlistItem?.title ?? wishlistItemTitle;
  }

  const finalPayload = {
    ...payload,
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

  await supabase.from("gift_history_items").delete().eq("id", id);

  revalidatePath("/gift-history");
  revalidatePath("/admin");
  revalidatePath("/admin/gift-history");
}
