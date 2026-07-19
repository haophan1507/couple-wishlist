"use client";

import { usePathname } from "next/navigation";
import { NavLink } from "@/components/nav-link";
import { APP_NAV_LINKS } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {APP_NAV_LINKS.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <NavLink
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition",
              active
                ? "bg-blush text-mocha shadow-xs dark:bg-white/10 dark:text-white"
                : "text-mocha/75 hover:bg-white/70 hover:text-mocha dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </NavLink>
        );
      })}
    </>
  );
}
