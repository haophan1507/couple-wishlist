"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { wishlistSchema } from "@/lib/validation";

export async function upsertWishlistItemAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = wishlistSchema.safeParse({
    owner_type: formData.get("owner_type"),
    title: formData.get("title"),
    description: formData.get("description"),
    image_url: formData.get("image_url"),
    product_url: formData.get("product_url"),
    price_min: formData.get("price_min") || undefined,
    price_max: formData.get("price_max") || undefined,
    category: formData.get("category"),
    priority: formData.get("priority"),
    note: formData.get("note"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error("Invalid wishlist form data");
  }

  const payload = {
    ...parsed.data,
    image_url: parsed.data.image_url || null,
    product_url: parsed.data.product_url || null,
    category: parsed.data.category || null,
    note: parsed.data.note || null,
    description: parsed.data.description || null,
    price_min: parsed.data.price_min ?? null,
    price_max: parsed.data.price_max ?? null,
    updated_at: new Date().toISOString()
  };

  const supabase = createSupabaseAdminClient();

  if (id) {
    await supabase.from("wishlist_items").update(payload).eq("id", id);
  } else {
    await supabase.from("wishlist_items").insert(payload);
  }

  revalidatePath("/wishlist");
  revalidatePath("/");
  revalidatePath("/admin/wishlist");
}

export async function deleteWishlistItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();

  await supabase.from("reservations").delete().eq("wishlist_item_id", id);
  await supabase.from("wishlist_items").delete().eq("id", id);

  revalidatePath("/wishlist");
  revalidatePath("/");
  revalidatePath("/admin/wishlist");
}
