import { signInAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/container";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? "/admin";

  return (
    <section className="min-h-screen py-16">
      <Container className="max-w-md">
        <div className="card p-8">
          <h1 className="text-3xl font-semibold font-[var(--font-heading)]">Đăng nhập quản trị</h1>
          <p className="mt-2 text-sm text-mocha/70">Đăng nhập để quản lý nội dung wishlist.</p>

          <form action={signInAction} className="mt-6 space-y-3">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input className="w-full" type="email" name="email" placeholder="Email" required />
            <input className="w-full" type="password" name="password" placeholder="Mật khẩu" required />
            <button type="submit" className="w-full rounded-xl bg-mocha px-4 py-2 text-sm text-white">
              Đăng nhập
            </button>
          </form>
          {params.error ? <p className="mt-3 text-xs text-red-600">{params.error}</p> : null}
        </div>
      </Container>
    </section>
  );
}
