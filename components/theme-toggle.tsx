"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener("themechange", handleChange);
  mediaQuery.addEventListener("change", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("themechange", handleChange);
    mediaQuery.removeEventListener("change", handleChange);
  };
}

function getThemeSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => null);

  useEffect(() => {
    if (!theme) {
      return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const isDark = theme === "dark";
  const mounted = theme !== null;

  return (
    <button
      type="button"
      aria-label="Đổi giao diện"
      aria-busy={!mounted}
      onClick={() => {
        if (!mounted) return;
        const next = isDark ? "light" : "dark";
        localStorage.setItem("theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
        window.dispatchEvent(new Event("themechange"));
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
