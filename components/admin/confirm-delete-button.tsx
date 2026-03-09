"use client";

import { useState } from "react";

type ConfirmDeleteButtonProps = {
  formId: string;
  itemName?: string;
};

export function ConfirmDeleteButton({ formId, itemName }: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) {
      return;
    }

    setSubmitting(true);
    form.requestSubmit();
  };

  return (
    <>
      <button type="button" className="text-xs text-red-600" onClick={() => setOpen(true)}>
        Xóa
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold">Xác nhận xóa</h3>
            <p className="mt-2 text-sm text-mocha/75">
              {itemName
                ? `Bạn có chắc muốn xóa "${itemName}" không? Hành động này không thể hoàn tác.`
                : "Bạn có chắc muốn xóa mục này không? Hành động này không thể hoàn tác."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-mocha/20 px-3 py-2 text-sm"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white"
                disabled={submitting}
              >
                {submitting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
