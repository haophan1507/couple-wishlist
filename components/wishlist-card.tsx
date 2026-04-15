import Link from "next/link";
import { ExternalLink, NotebookText, Tag } from "lucide-react";
import { getWishlistFallbackImage } from "@/lib/constants/wishlist";
import type { PublicWishlistItem } from "@/lib/data/queries";

function currency(value: number | null) {
  if (value === null) {
    return "Chưa có giá";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value);
}

const priorityLabel: Record<string, string> = {
  low: "Ưu tiên thấp",
  medium: "Ưu tiên trung bình",
  high: "Ưu tiên cao"
};

const priorityDotClass: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-amber-400",
  high: "bg-rose-500"
};

export function WishlistCard({ item }: { item: PublicWishlistItem }) {
  const productUrls = item.product_urls ?? [];

  return (
    <article className="group relative isolate overflow-hidden rounded-[2rem] border border-white/95 bg-white/95 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_14px_30px_-24px_rgba(122,82,95,0.55)] ring-1 ring-rose/10 transition duration-300 hover:-translate-y-0.5 hover:border-rose/25 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_36px_-24px_rgba(122,82,95,0.62)] hover:ring-rose/20 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-white/10 dark:hover:border-white/20 dark:hover:ring-white/20">
      <div className="relative overflow-hidden">
        <img
          src={item.image_url ?? getWishlistFallbackImage(item.category)}
          alt={item.title}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/8 to-transparent" />
      </div>
      <div className="bg-gradient-to-b from-white/95 to-white/92 p-5 dark:from-transparent dark:to-transparent">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight dark:text-white">{item.title}</h3>
          <span
            className={`mt-1 inline-block h-3.5 w-3.5 rounded-full ${priorityDotClass[item.priority]}`}
            aria-label={priorityLabel[item.priority]}
            title={priorityLabel[item.priority]}
          />
        </div>
        {item.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-mocha/75 dark:text-white/60">
            {item.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-mocha/70 dark:text-white/60">
          {item.category ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1.5 dark:bg-white/10">
              <Tag className="h-3 w-3" />
              {item.category}
            </span>
          ) : null}
          <span className="rounded-full bg-sand px-2.5 py-1.5 dark:bg-white/10">{currency(item.price_min)}</span>
          {item.price_max && item.price_max !== item.price_min ? (
            <span className="rounded-full bg-sand px-2.5 py-1.5 dark:bg-white/10">đến {currency(item.price_max)}</span>
          ) : null}
        </div>

        {productUrls.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {productUrls.map((url, index) => (
              <Link
                key={`${url}-${index}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-mocha/20 bg-white px-3 py-1.5 text-xs font-medium text-mocha/85 transition hover:bg-blush dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              >
                Link {index + 1}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        ) : null}

        {item.status === "gifted" ? (
          <p className="mt-4 rounded-2xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Đã tặng</p>
        ) : (
          <p className="mt-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Có sẵn</p>
        )}

        {item.note ? (
          <div className="mt-4 flex gap-2 rounded-2xl border border-rose/15 bg-blush/60 px-3 py-2.5 text-mocha/70 dark:border-white/10 dark:bg-white/10 dark:text-white/65">
            <NotebookText className="mt-0.5 h-4 w-4 shrink-0 opacity-65" />
            <p className="line-clamp-2 text-sm italic leading-6">{item.note}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
