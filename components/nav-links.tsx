"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/wishlist", label: "Danh sách quà" },
  { href: "/special-days", label: "Ngày đặc biệt" },
  { href: "/gallery", label: "Khoảnh khắc" }
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition",
              active
                ? "bg-blush text-mocha shadow-sm dark:bg-white/10 dark:text-white"
                : "text-mocha/75 hover:bg-white/70 hover:text-mocha dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
