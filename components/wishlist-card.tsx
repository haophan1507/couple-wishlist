import Link from "next/link";
import { ExternalLink, Tag } from "lucide-react";
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
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao"
};

export function WishlistCard({ item }: { item: PublicWishlistItem }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_16px_34px_-22px_rgba(140,95,110,0.42)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-22px_rgba(140,95,110,0.5)] dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:translate-y-0">
      <div className="relative overflow-hidden">
        <img
          src={
            item.image_url ??
            "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80"
          }
          alt={item.title}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/8 to-transparent" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight dark:text-white">{item.title}</h3>
          <span className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-mocha/85 dark:bg-white/10 dark:text-white/80">
            {priorityLabel[item.priority]}
          </span>
        </div>
        {item.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-mocha/75 dark:text-white/60">{item.description}</p>
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

        {item.product_url ? (
          <Link
            href={item.product_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-mocha underline-offset-4 hover:underline dark:text-white/80"
          >
            Link sản phẩm
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}

        {item.status === "gifted" ? (
          <p className="mt-4 rounded-2xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Đã tặng</p>
        ) : (
          <p className="mt-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Có sẵn</p>
        )}
      </div>
    </article>
  );
}
