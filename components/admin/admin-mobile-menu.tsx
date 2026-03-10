"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils/cn";

const adminLinks = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/wishlist", label: "Danh sách quà" },
  { href: "/admin/gift-history", label: "Lịch sử quà" },
  { href: "/admin/places", label: "Heart Mapping" },
  { href: "/admin/special-days", label: "Ngày đặc biệt" },
  { href: "/admin/gallery", label: "Khoảnh khắc" },
];

export function AdminMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        aria-label={open ? "Đóng điều hướng quản trị" : "Mở điều hướng quản trị"}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-mocha/20 bg-white/95 text-mocha/85 shadow-soft backdrop-blur transition hover:bg-white dark:border-white/20 dark:bg-[#241f22]/95 dark:text-white/85 dark:hover:bg-[#2a2428]"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Đóng menu quản trị"
            className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-3 bottom-20 z-40 rounded-3xl border border-white/80 bg-cream/95 p-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#1e1a1c]/95">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-mocha/55 dark:text-white/45">
              Điều hướng quản trị
            </p>
            <nav className="space-y-1">
              {adminLinks.map((link) => {
                const active =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-blush text-mocha dark:bg-white/10 dark:text-white"
                        : "text-mocha/75 hover:bg-white/80 dark:text-white/70 dark:hover:bg-white/5",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <form action={signOutAction} className="mt-2 border-t border-mocha/10 pt-2 dark:border-white/10">
              <button
                type="submit"
                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-mocha/80 transition hover:bg-white/80 dark:text-white/75 dark:hover:bg-white/5"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}

