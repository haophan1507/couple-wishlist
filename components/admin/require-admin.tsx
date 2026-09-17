import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { getAdminSession, getAuthUser } from "@/lib/auth/session";
import { PageLoading } from "@/components/ui/page-loading";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const user = await getAuthUser();
      if (!user) {
        await navigate({
          to: "/login",
          search: { redirect: href, error: undefined },
        });
        return;
      }

      const admin = await getAdminSession();
      if (!admin) {
        await navigate({ to: "/unauthorized" });
        return;
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, [href, navigate]);

  if (!ready) {
    return (
      <PageLoading
        title="Đang kiểm tra..."
        description="Đang xác nhận quyền quản trị."
        cards={2}
      />
    );
  }

  return children;
}
