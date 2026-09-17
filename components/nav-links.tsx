import { useRouterState } from "@tanstack/react-router";
import { NavLink } from "@/components/nav-link";
import { APP_NAV_LINKS } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

export function NavLinks() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <>
      {APP_NAV_LINKS.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <NavLink
            key={link.href}
            to={link.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition",
              active
                ? "bg-secondary text-foreground shadow-xs"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
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
