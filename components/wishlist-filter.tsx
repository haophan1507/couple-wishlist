import { useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  DEFAULT_WISHLIST_STATUS_FILTER,
  WISHLIST_STATUS_FILTER_OPTIONS,
  type WishlistStatusFilter,
} from "@/lib/constants/wishlist";

export type WishlistSearch = {
  category?: string;
  q?: string;
  status?: WishlistStatusFilter;
  mePage?: string;
  honeyPage?: string;
};

type WishlistFilterProps = {
  categories: string[];
  search: WishlistSearch;
  isFetching?: boolean;
  onSearchChange: (patch: Partial<Pick<WishlistSearch, "category" | "q" | "status">>) => void;
};

export function WishlistFilter({
  categories,
  search,
  isFetching,
  onSearchChange,
}: WishlistFilterProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearchChange({ q: value || undefined });
    }, 350);
  };

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mô tả..."
          defaultValue={search.q ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9!"
        />
      </div>
      <select
        aria-label="Lọc theo trạng thái"
        value={search.status ?? DEFAULT_WISHLIST_STATUS_FILTER}
        onChange={(e) => {
          const status = e.target.value as WishlistStatusFilter;
          onSearchChange({ status: status === DEFAULT_WISHLIST_STATUS_FILTER ? undefined : status });
        }}
      >
        {WISHLIST_STATUS_FILTER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="relative">
        <select
          aria-label="Lọc theo danh mục"
          value={search.category ?? ""}
          onChange={(e) => onSearchChange({ category: e.target.value || undefined })}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {isFetching ? (
          <Loader2 className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-rose" />
        ) : null}
      </div>
    </div>
  );
}
