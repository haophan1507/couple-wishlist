import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function UnauthorizedPage() {
  return (
    <section className="py-16">
      <Container className="max-w-xl">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-semibold">Không có quyền truy cập</h1>
          <p className="mt-2 text-sm text-mocha/70">Tài khoản của bạn không có quyền quản trị.</p>
          <Link href="/" className="mt-5 inline-block rounded-xl border border-mocha/20 px-4 py-2 text-sm">
            Về trang chủ
          </Link>
        </div>
      </Container>
    </section>
  );
}
