import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigationPending } from "@/components/navigation-pending";
import { cn } from "@/lib/utils/cn";

type NavLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  "aria-current"?: "page" | undefined;
};

function NavLinkPending({ children, isPending }: { children: ReactNode; isPending: boolean }) {
  const { setLinkPending } = useNavigationPending();

  useEffect(() => {
    if (!isPending) return;
    setLinkPending(true);
    return () => setLinkPending(false);
  }, [isPending, setLinkPending]);

  return <span className={cn(isPending && "opacity-55")}>{children}</span>;
}

export function NavLink({ children, className, to, onClick, ...props }: NavLinkProps) {
  const isPending = useRouterState({
    select: (state) =>
      state.status === "pending" &&
      state.resolvedLocation?.pathname !== state.location.pathname &&
      state.location.pathname === to,
  });

  return (
    <Link to={to} onClick={onClick} className={cn(className, "transition-opacity")} {...props}>
      <NavLinkPending isPending={isPending}>{children}</NavLinkPending>
    </Link>
  );
}
