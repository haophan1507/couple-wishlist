"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils/cn";

type FormSubmitButtonProps = {
  idleLabel: string;
  loadingLabel: string;
  className?: string;
};

export function FormSubmitButton({ idleLabel, loadingLabel, className }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-fit rounded-xl bg-mocha px-4 py-2 text-sm text-white transition hover:opacity-95 dark:bg-white dark:text-[#1e1a1c] dark:hover:bg-white/90",
        className,
      )}
    >
      {pending ? loadingLabel : idleLabel}
    </button>
  );
}
