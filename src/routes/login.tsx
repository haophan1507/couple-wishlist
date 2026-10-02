import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch("/admin"),
  error: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo = "/admin", error: searchError } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState(searchError);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(undefined);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Email hoặc mật khẩu không đúng");
        return;
      }

      await navigate({ to: redirectTo || "/admin" });
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="min-h-dvh py-16">
      <Container className="max-w-md">
        <div className="card p-8">
          <h1 className="text-3xl font-heading font-semibold dark:text-white">
            Đăng nhập quản trị
          </h1>
          <p className="mt-2 text-sm text-muted-foreground dark:text-white/55">
            Đăng nhập để quản lý wishlist, ngày đặc biệt, địa điểm và khoảnh khắc.
          </p>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/80">Email</span>
              <input
                className="w-full"
                type="email"
                name="email"
                placeholder="ban@email.com"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/80">Mật khẩu</span>
              <input
                className="w-full"
                type="password"
                name="password"
                placeholder="Mật khẩu của bạn"
                required
              />
            </label>
            <Button type="submit" disabled={pending} size="lg" className="w-full rounded-xl">
              {pending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
          {error ? <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
        </div>
      </Container>
    </section>
  );
}
