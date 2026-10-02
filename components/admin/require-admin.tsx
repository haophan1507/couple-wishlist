import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { getAdminSession, getAuthUser } from "@/lib/auth/session";
import { PageLoading } from "@/components/ui/page-loading";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Read href once: depending on it would re-run this effect after navigating to /login and loop forever.
    const redirectTo = router.state.location.href;

    async function check() {
      const user = await getAuthUser();
      if (cancelled) return;
      if (!user) {
        await router.navigate({
          to: "/login",
          search: { redirect: redirectTo, error: undefined },
          replace: true,
        });
        return;
      }

      const admin = await getAdminSession();
      if (cancelled) return;
      if (!admin) {
        await router.navigate({ to: "/unauthorized", replace: true });
        return;
      }

      setReady(true);
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <PageLoading title="Đang kiểm tra..." description="Đang xác nhận quyền quản trị." cards={2} />
    );
  }

  return children;
}
