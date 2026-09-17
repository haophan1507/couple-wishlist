import type { ReactNode } from "react";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";

type AdminItemRowProps = {
  title: string;
  meta?: ReactNode;
  imagePath?: string | null;
  itemNameForDelete?: string;
  isExpanded: boolean;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  children?: ReactNode;
};

export function AdminItemRow({
  title,
  meta,
  imagePath,
  itemNameForDelete,
  isExpanded,
  onEdit,
  onDelete,
  children,
}: AdminItemRowProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush/60 dark:bg-white/10">
          {imagePath ? (
            <AppImage
              path={imagePath}
              alt=""
              variant="thumb"
              aspect="natural"
              className="h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium dark:text-white">{title}</p>
          {meta ? (
            <div className="mt-1 text-xs text-mocha/65 dark:text-white/50">{meta}</div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant={isExpanded ? "secondary" : "outline"}
            size="sm"
            onClick={onEdit}
          >
            {isExpanded ? "Đóng" : "Sửa"}
          </Button>
          <ConfirmDeleteButton itemName={itemNameForDelete ?? title} onConfirm={onDelete} />
        </div>
      </div>
      {isExpanded && children ? (
        <div className="border-t border-mocha/10 p-4 dark:border-white/10">{children}</div>
      ) : null}
    </div>
  );
}
