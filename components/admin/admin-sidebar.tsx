"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/wishlist", label: "Danh sách quà" },
  { href: "/admin/special-days", label: "Ngày đặc biệt" },
  { href: "/admin/gallery", label: "Khoảnh khắc" }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="card h-fit p-4 md:sticky md:top-20">
      <h2 className="px-2 py-2 font-semibold">Quản trị</h2>
      <nav className="mt-2 space-y-1">
        {links.map((link) => (
          (() => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-blush font-medium text-mocha"
                : "text-mocha/80 hover:bg-blush hover:text-mocha"
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
            );
          })()
        ))}
      </nav>

      <form action={signOutAction} className="mt-4 border-t border-mocha/10 pt-4">
        <button type="submit" className="w-full rounded-xl border border-mocha/20 px-3 py-2 text-sm hover:bg-white">
          Đăng xuất
        </button>
      </form>
    </aside>
  );
}
