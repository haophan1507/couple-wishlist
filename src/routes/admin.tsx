import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";
import { RequireAdmin } from "@/components/admin/require-admin";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </RequireAdmin>
  );
}
