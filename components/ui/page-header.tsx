import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  title,
  description,
  actions,
  className,
  compact = false,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1
          className={cn(
            compact ? "text-2xl font-semibold tracking-tight text-foreground" : "section-title",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className={cn(compact ? "mt-1 text-sm text-muted-foreground" : "section-subtitle")}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
