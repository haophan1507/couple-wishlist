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

export function ConfirmDeleteButton({
  formId,
  itemName,
  onConfirm,
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else if (formId) {
        const form = document.getElementById(formId) as HTMLFormElement | null;
        form?.requestSubmit();
      }
      setOpen(false);
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
        onClick={() => setOpen(true)}
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
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
