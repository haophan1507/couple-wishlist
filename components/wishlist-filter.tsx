"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

type WishlistFilterProps = {
  categories: string[];
};

export function WishlistFilter({ categories }: WishlistFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `?${qs}` : "/wishlist", { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  const handleSearch = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => updateParams("q", value), 350);
  };

  const handleCategory = (value: string) => {
    updateParams("category", value);
  };

  return (
    <div className="mt-6 grid gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5 md:grid-cols-[2fr_1fr]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha/40" />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mô tả..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="!pl-9"
        />
      </div>
      <div className="relative">
        <select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => handleCategory(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {isPending ? (
          <Loader2 className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-rose" />
        ) : null}
      </div>
    </div>
  );
}
