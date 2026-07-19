"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import { useNavigationPending } from "@/components/navigation-pending";
import { cn } from "@/lib/utils/cn";

type NavLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
};

function NavLinkPending({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();
  const { setLinkPending } = useNavigationPending();

  useEffect(() => {
    if (!pending) return;
    setLinkPending(true);
    return () => setLinkPending(false);
  }, [pending, setLinkPending]);

  return <span className={cn(pending && "opacity-55")}>{children}</span>;
}

export function NavLink({ children, className, ...props }: NavLinkProps) {
  return (
    <Link {...props} className={cn(className, "transition-opacity")}>
      <NavLinkPending>{children}</NavLinkPending>
    </Link>
  );
}
