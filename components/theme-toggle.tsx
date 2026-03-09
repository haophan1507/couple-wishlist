"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="Đổi giao diện"
      aria-busy={!mounted}
      onClick={() => {
        if (!mounted) return;
        const next = isDark ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }}
      className="rounded-full border border-mocha/20 p-2 text-mocha/80 transition hover:bg-white dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
    >
      {!mounted ? (
        <span className="block h-4 w-4 opacity-0" />
      ) : isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
