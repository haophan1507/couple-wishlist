import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold dark:text-white">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-mocha/70 dark:text-white/50">Trang bạn yêu cầu không tồn tại.</p>
      <Link href="/" className="mt-5 inline-block rounded-xl border border-mocha/20 px-4 py-2 text-sm dark:border-white/20 dark:text-white/80">
        Về trang chủ
      </Link>
    </div>
  );
}
