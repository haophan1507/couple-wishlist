import { NextResponse } from "next/server";
import { upsertGiftHistoryItemAction } from "@/app/actions/gift-history";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await upsertGiftHistoryItemAction(formData);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể lưu lịch sử quà.";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
