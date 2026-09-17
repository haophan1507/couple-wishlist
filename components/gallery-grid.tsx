import { format } from "date-fns";
import { ImageIcon } from "lucide-react";
import type { GalleryEntry } from "@/lib/data/client-queries";
import { EmptyState } from "@/components/ui/empty-state";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80";

export function GalleryGrid({ items }: { items: GalleryEntry[] }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<ImageIcon />}
        title="Chưa có kỷ niệm nào"
        description="Hãy thêm ảnh đầu tiên trong trang quản trị."
      />
    );
  }

  return (
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
      {items.map((item) => (
        <article key={item.id} className="card mb-4 break-inside-avoid p-3">
          <img
            src={item.image_url ?? FALLBACK_IMAGE}
            alt={item.image_alt ?? item.caption ?? "Ảnh kỷ niệm"}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <div className="px-1 pb-1 pt-3">
            {item.caption ? (
              <p className="text-sm font-medium dark:text-white">{item.caption}</p>
            ) : null}
            {item.memory_date ? (
              <p className="mt-1 text-xs text-mocha/65 dark:text-white/50">
                {format(new Date(item.memory_date), "PPP")}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
