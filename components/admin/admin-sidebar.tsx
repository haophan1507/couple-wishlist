import { useRouterState } from "@tanstack/react-router";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { NavLink } from "@/components/nav-link";
import { ADMIN_NAV_LINKS } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

export function AdminSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="card hidden h-fit p-4 md:block md:w-[220px] md:sticky md:top-4 md:max-h-[calc(100dvh-2rem)] md:overflow-y-auto md:self-start">
      <h2 className="px-2 py-2 font-semibold text-foreground">Quản trị</h2>
      <nav className="mt-2 space-y-1">
        {ADMIN_NAV_LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <NavLink
              key={link.href}
              to={link.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-mocha/10 pt-4 dark:border-white/10">
        <button
          type="button"
          className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground hover:bg-background"
          onClick={async () => {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
