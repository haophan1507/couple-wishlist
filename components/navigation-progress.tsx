"use client";

import { useNavigationPending } from "@/components/navigation-pending";
import { cn } from "@/lib/utils/cn";

export function NavigationProgress() {
  const { pending } = useNavigationPending();

  return (
    <div
      aria-hidden={!pending}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden transition-opacity duration-150",
        pending ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "h-full w-1/3 rounded-full bg-rose/80 dark:bg-rose/70",
          pending && "animate-nav-progress",
        )}
      />
    </div>
  );
}
