import { format } from "date-fns";
import { getGalleryItems } from "@/lib/data/queries";

type GalleryItem = Awaited<ReturnType<typeof getGalleryItems>>[number];

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  if (!items.length) {
    return <p className="card p-8 text-center text-mocha/70 dark:text-white/50">Chưa có kỷ niệm nào. Hãy thêm ảnh đầu tiên trong trang quản trị.</p>;
  }

  return (
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
      {items.map((item) => (
        <article key={item.id} className="card mb-4 break-inside-avoid p-3">
          <img
            src={item.image_url ?? "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80"}
            alt={item.image_alt ?? item.caption ?? "Ảnh kỷ niệm"}
            className="w-full rounded-2xl object-cover"
          />
          <div className="px-1 pb-1 pt-3">
            {item.caption ? <p className="text-sm font-medium dark:text-white">{item.caption}</p> : null}
            {item.memory_date ? (
              <p className="mt-1 text-xs text-mocha/65 dark:text-white/50">{format(new Date(item.memory_date), "PPP")}</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
