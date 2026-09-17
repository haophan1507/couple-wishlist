import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

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
      <PageHeader
        title={title}
        description={description}
        compact
        actions={
          <Button
            type="button"
            variant={isCreating ? "outline" : "default"}
            onClick={onToggleCreate}
          >
            {isCreating ? "Hủy thêm" : "Thêm mới"}
          </Button>
        }
      />
      {children}
    </section>
  );
}
