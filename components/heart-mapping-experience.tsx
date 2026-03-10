"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { CalendarDays, Heart, MapPinned, MapPin } from "lucide-react";
import type { PlaceMemoryEntry } from "@/lib/data/queries";
import { cn } from "@/lib/utils/cn";
import { PlaceDetailsSheet } from "@/components/place-details-sheet";
import { HeartDiagram } from "@/components/heart-diagram";

const DynamicRealMapView = dynamic(
  () => import("@/components/real-map-view").then((mod) => mod.RealMapView),
  { ssr: false },
);

type Mode = "heart" | "map";

export function HeartMappingExperience({ places }: { places: PlaceMemoryEntry[] }) {
  const [mode, setMode] = useState<Mode>("heart");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const visitedPlaces = useMemo(
    () =>
      places
        .filter((place) => place.status === "visited")
        .sort((a, b) => (a.visit_date ?? "").localeCompare(b.visit_date ?? "") || a.id.localeCompare(b.id)),
    [places],
  );
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title font-[var(--font-heading)]">Heart Mapping</h1>
          <p className="section-subtitle">
            Một bản đồ vừa tượng trưng vừa thực tế cho những nơi hai bạn đã đi qua và còn muốn ghé đến.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-mocha/15 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
          {([
            { key: "heart", label: "Trái tim", icon: Heart },
            { key: "map", label: "Bản đồ", icon: MapPinned },
          ] as const).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                  mode === item.key
                    ? "bg-blush text-mocha dark:bg-white/10 dark:text-white"
                    : "text-mocha/70 hover:bg-white dark:text-white/65 dark:hover:bg-white/5",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-6 md:p-8">
          {mode === "heart" ? (
            visitedPlaces.length ? (
              <HeartDiagram
                className="my-2"
                sections={visitedPlaces.map((place) => ({
                  id: place.id,
                  title: place.title,
                  description: place.description ?? place.location_name,
                  imageUrl: place.cover_image_url ?? undefined,
                  accent: place.id === selectedPlaceId,
                }))}
                selectedId={selectedPlaceId}
                onSelect={setSelectedPlaceId}
              />
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] bg-blush/40 text-center dark:bg-white/5">
                <div>
                  <p className="text-lg font-medium dark:text-white">Chưa có nơi nào đã ghé thăm.</p>
                  <p className="mt-2 text-sm text-mocha/70 dark:text-white/55">
                    Khi thêm địa điểm trạng thái đã đi, chúng sẽ xuất hiện thành các nhịp tim nhỏ.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="relative">
              <DynamicRealMapView
                places={places}
                selectedPlaceId={selectedPlaceId}
                onSelect={setSelectedPlaceId}
                className="h-[560px] md:h-[660px] xl:h-[760px]"
              />
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-semibold dark:text-white">Tổng quan</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl bg-blush/80 p-4 dark:bg-white/5">
                <p className="text-xs text-mocha/55 dark:text-white/45">Đã đi cùng nhau</p>
                <p className="mt-1 text-2xl font-semibold dark:text-white">{visitedPlaces.length}</p>
              </div>
              <div className="rounded-2xl bg-blush/80 p-4 dark:bg-white/5">
                <p className="text-xs text-mocha/55 dark:text-white/45">Dự định tiếp theo</p>
                <p className="mt-1 text-2xl font-semibold dark:text-white">
                  {places.filter((place) => place.status === "planned").length}
                </p>
              </div>
              <div className="rounded-2xl bg-blush/80 p-4 dark:bg-white/5">
                <p className="text-xs text-mocha/55 dark:text-white/45">Có ảnh lưu lại</p>
                <p className="mt-1 text-2xl font-semibold dark:text-white">
                  {places.filter((place) => place.cover_image_url || place.images.length).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold dark:text-white">
              {mode === "heart" ? "Những nơi đã đi qua" : "Danh sách địa điểm"}
            </h2>
            <div className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto pr-1 md:max-h-[60vh] xl:max-h-[68vh]">
              {(mode === "heart" ? visitedPlaces : places).map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    place.id === selectedPlaceId
                      ? "border-rose/35 bg-blush/70 dark:border-white/20 dark:bg-white/10"
                      : "border-mocha/10 bg-white/70 hover:border-rose/20 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                    place.status === "planned" && mode === "map" ? "opacity-70" : "",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium dark:text-white">{place.title}</p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        place.status === "visited"
                          ? "bg-rose/15 text-rose-700 dark:bg-rose/20 dark:text-rose-300"
                          : "bg-mocha/10 text-mocha/70 dark:bg-white/10 dark:text-white/65",
                      )}
                    >
                      {place.status === "visited" ? "Đã đi" : "Dự định"}
                    </span>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-mocha/70 dark:text-white/60">
                    <MapPin className="h-4 w-4" />
                    {place.location_name}
                  </p>
                  {place.visit_date ? (
                    <p className="mt-1 inline-flex items-center gap-2 text-xs text-mocha/60 dark:text-white/45">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {place.visit_date}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <PlaceDetailsSheet
        place={selectedPlace}
        open={Boolean(selectedPlace)}
        onClose={() => setSelectedPlaceId(null)}
      />
    </>
  );
}
