import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition",
        variant === "primary" && "bg-mocha text-white hover:opacity-90 dark:bg-white dark:text-[#1e1a1c] dark:hover:bg-white/90",
        variant === "ghost" && "bg-transparent text-mocha hover:bg-mocha/5 dark:text-white/80 dark:hover:bg-white/5",
        variant === "outline" && "border border-mocha/20 bg-white text-mocha hover:border-mocha/40 dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
