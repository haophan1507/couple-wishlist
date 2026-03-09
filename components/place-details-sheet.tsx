"use client";

import { format } from "date-fns";
import { CalendarDays, Heart, MapPin, Route } from "lucide-react";
import type { PlaceMemoryEntry } from "@/lib/data/queries";

export function PlaceDetailsSheet({
  place,
  open,
  onClose,
}: {
  place: PlaceMemoryEntry | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !place) {
    return null;
  }

  const allImages: Array<{
    id: string;
    image_url: string | null;
    image_alt: string | null;
    caption: string | null;
  }> = [
    ...(place.cover_image_url
      ? [
          {
            id: `${place.id}-cover`,
            image_url: place.cover_image_url,
            image_alt: place.cover_image_alt,
            caption: null,
          },
        ]
      : []),
    ...place.images.map((image) => ({
      id: image.id,
      image_url: image.image_url,
      image_alt: image.image_alt,
      caption: image.caption,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/35 backdrop-blur-sm md:items-stretch">
      <button type="button" aria-label="Đóng chi tiết" className="absolute inset-0" onClick={onClose} />
      <aside className="relative z-10 h-[85vh] w-full overflow-y-auto rounded-t-[2rem] bg-cream p-6 shadow-soft dark:bg-[#1e1a1c] md:h-auto md:w-[440px] md:rounded-none md:rounded-l-[2rem]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-mocha/45 dark:text-white/35">
              {place.status === "visited" ? "Đã đi cùng nhau" : "Dự định tương lai"}
            </p>
            <h3 className="mt-2 text-2xl font-semibold dark:text-white">{place.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-mocha/15 px-3 py-1.5 text-sm text-mocha/75 hover:bg-white dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
          >
            Đóng
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-blush/80 p-4 dark:bg-white/5">
            <p className="inline-flex items-center gap-2 text-xs text-mocha/55 dark:text-white/45">
              <MapPin className="h-3.5 w-3.5" />
              Địa điểm
            </p>
            <p className="mt-2 text-sm font-medium dark:text-white">{place.location_name}</p>
          </div>
          <div className="rounded-2xl bg-blush/80 p-4 dark:bg-white/5">
            <p className="inline-flex items-center gap-2 text-xs text-mocha/55 dark:text-white/45">
              {place.status === "visited" ? <CalendarDays className="h-3.5 w-3.5" /> : <Route className="h-3.5 w-3.5" />}
              {place.status === "visited" ? "Ngày ghé thăm" : "Trạng thái"}
            </p>
            <p className="mt-2 text-sm font-medium dark:text-white">
              {place.visit_date ? format(new Date(place.visit_date), "dd/MM/yyyy") : "Đang lên kế hoạch"}
            </p>
          </div>
        </div>

        {place.description ? (
          <div className="mt-5 rounded-2xl border border-mocha/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="inline-flex items-center gap-2 text-xs text-mocha/55 dark:text-white/45">
              <Heart className="h-3.5 w-3.5" />
              Cảm xúc lưu lại
            </p>
            <p className="mt-2 text-sm leading-6 text-mocha/85 dark:text-white/75">{place.description}</p>
          </div>
        ) : null}

        {allImages.length ? (
          <div className="mt-5 space-y-3">
            {allImages.map((image) => (
              <figure key={image.id} className="overflow-hidden rounded-2xl bg-white/80 dark:bg-white/5">
                <img
                  src={image.image_url ?? "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80"}
                  alt={image.image_alt ?? place.title}
                  className="h-56 w-full object-cover"
                />
                {image.caption ? (
                  <figcaption className="px-4 py-3 text-sm text-mocha/75 dark:text-white/65">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
