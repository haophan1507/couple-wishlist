"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reservationSchema } from "@/lib/validation";
import { initialActionState, type ActionState } from "@/app/actions/types";

export async function reserveGiftAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = reservationSchema.safeParse({
    wishlist_item_id: formData.get("wishlist_item_id"),
    visitor_name: formData.get("visitor_name"),
    visitor_email: formData.get("visitor_email"),
    note: formData.get("note")
  });

  if (!parsed.success) {
    return { ...initialActionState, message: "Vui lòng nhập thông tin đặt trước hợp lệ." };
  }

  const supabase = createSupabaseAdminClient();

  const { data: item } = await supabase
    .from("wishlist_items")
    .select("id, status")
    .eq("id", parsed.data.wishlist_item_id)
    .maybeSingle();

  if (!item || item.status !== "available") {
    return { success: false, message: "Món quà này không còn khả dụng." };
  }

  const { data: existing } = await supabase
    .from("reservations")
    .select("id")
    .eq("wishlist_item_id", parsed.data.wishlist_item_id)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Món quà này vừa được người khác đặt trước." };
  }

  const { error: reserveError } = await supabase.from("reservations").insert({
    wishlist_item_id: parsed.data.wishlist_item_id,
    visitor_name: parsed.data.visitor_name,
    visitor_email: parsed.data.visitor_email,
    note: parsed.data.note ?? null
  });

  if (reserveError) {
    return { success: false, message: "Không thể đặt trước lúc này. Vui lòng thử lại." };
  }

  await supabase
    .from("wishlist_items")
    .update({ status: "reserved", updated_at: new Date().toISOString() })
    .eq("id", parsed.data.wishlist_item_id);

  revalidatePath("/wishlist");
  revalidatePath("/");

  return {
    success: true,
    message: "Đặt trước thành công. Cảm ơn bạn đã cùng chung vui với tụi mình!"
  };
}
