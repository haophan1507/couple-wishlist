import type { ReactNode } from "react";
import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Container } from "@/components/ui/container";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <Container className="py-8 md:py-10">
      <AdminMobileMenu />
      <div className="grid items-start gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <AdminSidebar />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </Container>
  );
}
