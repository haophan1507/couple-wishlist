import { format } from "date-fns";
import { Archive, CheckCircle2, Gift, HeartHandshake, Link2, Sparkles } from "lucide-react";
import type { GiftHistoryEntry } from "@/lib/data/queries";
import { cn } from "@/lib/utils/cn";

const statusMap = {
  received: {
    label: "Đã nhận",
    icon: Gift,
    className: "bg-blush text-mocha dark:bg-white/10 dark:text-white/85",
  },
  thanked: {
    label: "Đã cảm ơn",
    icon: HeartHandshake,
    className: "bg-[#f4e7d7] text-mocha dark:bg-[#3a2e28] dark:text-[#f6e8de]",
  },
  archived: {
    label: "Lưu kỷ niệm",
    icon: Archive,
    className: "bg-white text-mocha/80 dark:bg-white/5 dark:text-white/75",
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

  return (
    <article className="card overflow-hidden">
      {item.photo_url ? (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={item.photo_url}
            alt={item.gift_name}
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-blush/70 dark:bg-white/5">
          <Sparkles className="h-8 w-8 text-mocha/60 dark:text-white/45" />
        </div>
      )}

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-mocha/45 dark:text-white/35">
              Món quà đã nhận
            </p>
            <h3 className="mt-1 text-xl font-semibold dark:text-white">
              {item.gift_name}
            </h3>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
              status.className,
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-blush/70 p-4 dark:bg-white/5">
            <p className="text-xs text-mocha/55 dark:text-white/45">Người nhận</p>
            <p className="mt-1 font-medium dark:text-white">{recipientName}</p>
          </div>
          <div className="rounded-2xl bg-blush/70 p-4 dark:bg-white/5">
            <p className="text-xs text-mocha/55 dark:text-white/45">Người tặng</p>
            <p className="mt-1 font-medium dark:text-white">{item.giver_name}</p>
          </div>
          <div className="rounded-2xl bg-blush/70 p-4 dark:bg-white/5">
            <p className="text-xs text-mocha/55 dark:text-white/45">Ngày nhận</p>
            <p className="mt-1 font-medium dark:text-white">
              {format(new Date(item.received_date), "dd/MM/yyyy")}
            </p>
          </div>
          <div className="rounded-2xl bg-blush/70 p-4 dark:bg-white/5">
            <p className="text-xs text-mocha/55 dark:text-white/45">Dịp gắn với món quà</p>
            <p className="mt-1 font-medium dark:text-white">
              {item.special_day?.title ?? "Một ngày bình thường nhưng đáng nhớ"}
            </p>
          </div>
        </div>

        {item.note ? (
          <div className="rounded-2xl border border-rose/15 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs text-mocha/55 dark:text-white/45">Lời nhắn / ghi chú</p>
            <p className="mt-2 text-sm leading-6 text-mocha/85 dark:text-white/75">
              {item.note}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 text-xs">
          {item.wishlist_item?.title || item.wishlist_item_title ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-mocha/80 dark:bg-white/5 dark:text-white/75">
              <Link2 className="h-3.5 w-3.5" />
              Từ wishlist: {item.wishlist_item?.title ?? item.wishlist_item_title}
            </span>
          ) : null}
          {item.status === "thanked" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-mocha/80 dark:bg-white/5 dark:text-white/75">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đã gửi lời cảm ơn
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
