"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { reserveGiftAction } from "@/app/actions/reservations";
import { initialActionState } from "@/app/actions/types";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Đang đặt trước..." : "Đặt trước quà"}
    </Button>
  );
}

export function ReserveGiftForm({ itemId }: { itemId: string }) {
  const [state, action] = useActionState(reserveGiftAction, initialActionState);

  return (
    <form action={action} className="mt-4 space-y-3 border-t border-mocha/10 pt-4 dark:border-white/10">
      <input type="hidden" name="wishlist_item_id" value={itemId} />
      <input name="visitor_name" placeholder="Tên của bạn" required />
      <input name="visitor_email" type="email" placeholder="Email của bạn" required />
      <textarea name="note" placeholder="Lời nhắn (không bắt buộc)" rows={2} />
      <SubmitButton />
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
