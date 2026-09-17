import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAV_LINKS } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

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
        className="rounded-full border border-border p-2 text-muted-foreground transition hover:bg-background hover:text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Đóng menu"
            className="fixed inset-0 top-16 z-40 cursor-default bg-black/30 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background/95 px-4 pb-5 pt-3 backdrop-blur-sm">
            <ul className="space-y-1">
              {APP_NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <li key={link.href}>
                    <NavLink
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-xl px-4 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex items-center gap-3 border-t border-border px-4 pt-3">
              <ThemeToggle />
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
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
