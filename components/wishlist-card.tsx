import { ExternalLink, Tag } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { getWishlistFallbackImage } from "@/lib/constants/wishlist";
import type { PublicWishlistItem } from "@/lib/data/client-queries";
import { cn } from "@/lib/utils/cn";

const vndCurrency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function currency(value: number | null) {
  if (value === null) {
    return "Chưa có giá";
  }

  return vndCurrency.format(value);
}

const priorityLabel: Record<string, string> = {
  low: "Ưu tiên thấp",
  medium: "Ưu tiên trung bình",
  high: "Ưu tiên cao",
};

const priorityDotClass: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-amber-400",
  high: "bg-rose-500",
};

export function WishlistCard({ item }: { item: PublicWishlistItem }) {
  const productUrls = item.product_urls ?? [];
  const priceLabel =
    item.price_max && item.price_max !== item.price_min
      ? `${currency(item.price_min)} – ${currency(item.price_max)}`
      : currency(item.price_min);

  return (
    <article className="card overflow-hidden transition hover:border-rose/30">
      <AppImage
        path={item.image_path}
        src={item.image_path ? undefined : getWishlistFallbackImage(item.category)}
        alt={item.title}
        variant="thumb"
        aspect="card"
        imgClassName="transition duration-500 group-hover:scale-[1.02]"
      />
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {item.title}
          </h3>
          <span
            className={cn(
              "mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full",
              priorityDotClass[item.priority],
            )}
            aria-label={priorityLabel[item.priority]}
            title={priorityLabel[item.priority]}
          />
        </div>

        {item.description ? (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {item.category ? (
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {item.category}
            </span>
          ) : null}
          <span>{priceLabel}</span>
        </div>

        {productUrls.length ? (
          <div className="flex flex-wrap gap-2">
            {productUrls.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80 underline-offset-2 hover:underline"
              >
                Link {index + 1}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        ) : null}

        <p
          className={cn(
            "text-sm font-medium",
            item.status === "gifted" ? "text-green-700 dark:text-green-400" : "text-rose-700 dark:text-rose-300",
          )}
        >
          {item.status === "gifted" ? "Đã tặng" : "Có sẵn"}
        </p>

        {item.note ? (
          <p className="line-clamp-2 text-sm italic leading-6 text-muted-foreground">
            {item.note}
          </p>
        ) : null}
      </div>
    </article>
  );
}
