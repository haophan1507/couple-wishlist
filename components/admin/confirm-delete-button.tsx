import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDeleteButtonProps = {
  formId?: string;
  itemName?: string;
  onConfirm?: () => void | Promise<void>;
};

export function ConfirmDeleteButton({ formId, itemName, onConfirm }: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (onConfirm) {
        await onConfirm();
      } else if (formId) {
        const form = document.getElementById(formId) as HTMLFormElement | null;
        form?.requestSubmit();
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa mục này.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="link"
        size="xs"
        className="h-auto px-0 text-destructive"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Xóa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              {itemName
                ? `Bạn có chắc muốn xóa "${itemName}" không? Hành động này không thể hoàn tác.`
                : "Bạn có chắc muốn xóa mục này không? Hành động này không thể hoàn tác."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col sm:items-end">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleConfirm()}
                disabled={submitting}
              >
                {submitting ? "Đang xóa..." : "Xác nhận xóa"}
              </Button>
            </div>
            {error ? <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p> : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
