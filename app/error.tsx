"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 className="text-2xl font-semibold">Đã xảy ra lỗi</h2>
      <p className="mt-2 text-sm text-mocha/70">{error.message}</p>
      <button onClick={reset} className="mt-5 rounded-xl bg-mocha px-4 py-2 text-sm text-white">
        Thử lại
      </button>
    </div>
  );
}
