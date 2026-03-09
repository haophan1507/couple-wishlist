"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/wishlist", label: "Danh sách quà" },
  { href: "/gift-history", label: "Quà đã nhận" },
  { href: "/special-days", label: "Ngày đặc biệt" },
  { href: "/gallery", label: "Khoảnh khắc" }
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        onClick={() => setOpen(!open)}
        className="rounded-full border border-mocha/20 p-2 text-mocha/80 transition hover:bg-white dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <nav className="fixed inset-x-0 top-16 z-50 border-b border-white/60 bg-cream/95 px-4 pb-5 pt-3 backdrop-blur dark:border-white/10 dark:bg-[#1e1a1c]/95">
            <ul className="space-y-1">
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block rounded-xl px-4 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-blush text-mocha dark:bg-white/10 dark:text-white"
                          : "text-mocha/75 hover:bg-white/70 dark:text-white/70 dark:hover:bg-white/5"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex items-center gap-3 border-t border-mocha/10 px-4 pt-3 dark:border-white/10">
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-full border border-mocha/20 px-4 py-2 text-sm hover:bg-white dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
              >
                Quản trị
              </Link>
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
