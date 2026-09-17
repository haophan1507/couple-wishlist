import { format } from "date-fns";
import { Archive, CheckCircle2, Gift, HeartHandshake, Link2, Sparkles } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import type { GiftHistoryEntry } from "@/lib/data/client-queries";
import { cn } from "@/lib/utils/cn";

const statusMap = {
  received: {
    label: "Đã nhận",
    icon: Gift,
    className: "bg-secondary text-foreground",
  },
  thanked: {
    label: "Đã cảm ơn",
    icon: HeartHandshake,
    className: "bg-muted text-foreground",
  },
  archived: {
    label: "Lưu kỷ niệm",
    icon: Archive,
    className: "bg-muted/60 text-muted-foreground",
  },
} as const;

export function GiftHistoryCard({
  item,
  recipientName,
}: {
  item: GiftHistoryEntry;
  recipientName: string;
}) {
  const status = statusMap[item.status];
  const StatusIcon = status.icon;
  const wishlistTitle = item.wishlist_item?.title || item.wishlist_item_title;

  return (
    <article className="card overflow-hidden">
      {item.photo_path ? (
        <AppImage
          path={item.photo_path}
          alt={item.gift_name}
          variant="thumb"
          aspect="wide"
        />
      ) : (
        <div className="flex aspect-16/10 items-center justify-center bg-secondary/70">
          <Sparkles className="h-7 w-7 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-3 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground md:text-xl">
              {item.gift_name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.giver_name} → {recipientName} ·{" "}
              {format(new Date(item.received_date), "dd/MM/yyyy")}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              status.className,
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </div>

        {item.special_day?.title ? (
          <p className="text-sm text-muted-foreground">
            Dịp: {item.special_day.title}
          </p>
        ) : null}

        {item.note ? (
          <p className="text-sm leading-6 text-foreground/85">{item.note}</p>
        ) : null}

        {wishlistTitle ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            Từ wishlist: {wishlistTitle}
          </p>
        ) : null}

        {item.status === "thanked" ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Đã gửi lời cảm ơn
          </p>
        ) : null}
      </div>
    </article>
  );
}
