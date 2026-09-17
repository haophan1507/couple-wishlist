import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AdminListHeaderProps = {
  title: string;
  description?: string;
  isCreating: boolean;
  onToggleCreate: () => void;
  children?: ReactNode;
};

export function AdminListHeader({
  title,
  description,
  isCreating,
  onToggleCreate,
  children,
}: AdminListHeaderProps) {
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">{description}</p>
          ) : null}
        </div>
        <Button type="button" variant={isCreating ? "outline" : "default"} onClick={onToggleCreate}>
          {isCreating ? "Hủy thêm" : "Thêm mới"}
        </Button>
      </div>
      {children}
    </section>
  );
}
