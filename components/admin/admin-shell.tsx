import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Container } from "@/components/ui/container";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <Container className="py-8 md:py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <AdminSidebar />
        <div className="space-y-6">{children}</div>
      </div>
    </Container>
  );
}
