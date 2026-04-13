import { NextResponse } from "next/server";
import { upsertWishlistItemAction } from "@/app/actions/wishlist";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await upsertWishlistItemAction(formData);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể lưu món quà lúc này.";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
