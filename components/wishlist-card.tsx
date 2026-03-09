import Link from "next/link";
import { ExternalLink, Tag } from "lucide-react";
import type { PublicWishlistItem } from "@/lib/data/queries";
import { ReserveGiftForm } from "@/components/reserve-gift-form";

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
    <article className="card overflow-hidden">
      <img
        src={
          item.image_url ??
          "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80"
        }
        alt={item.title}
        className="h-44 w-full object-cover"
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <span className="rounded-full bg-blush px-2.5 py-1 text-xs font-medium">{priorityLabel[item.priority]}</span>
        </div>
        {item.description ? <p className="mt-2 text-sm text-mocha/75">{item.description}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-mocha/70">
          {item.category ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-1">
              <Tag className="h-3 w-3" />
              {item.category}
            </span>
          ) : null}
          <span className="rounded-full bg-sand px-2 py-1">{currency(item.price_min)}</span>
          {item.price_max && item.price_max !== item.price_min ? (
            <span className="rounded-full bg-sand px-2 py-1">đến {currency(item.price_max)}</span>
          ) : null}
        </div>

        {item.product_url ? (
          <Link
            href={item.product_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-mocha underline-offset-4 hover:underline"
          >
            Link sản phẩm
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}

        {item.status === "gifted" ? (
          <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700">Đã tặng</p>
        ) : item.is_reserved ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">Đã đặt trước</p>
        ) : (
          <ReserveGiftForm itemId={item.id} />
        )}
      </div>
    </article>
  );
}
