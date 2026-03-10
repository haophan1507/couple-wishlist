"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { PlaceMapPicker } from "@/components/admin/place-map-picker";

type EditPlaceLocationProps = {
  locationName: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
};

export function EditPlaceLocation({
  locationName,
  city,
  country,
  latitude,
  longitude,
}: EditPlaceLocationProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-mocha/85 dark:text-white/75">
            Đang cập nhật vị trí
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-full border border-mocha/15 px-3 py-1.5 text-xs text-mocha/70 hover:bg-white dark:border-white/10 dark:text-white/65 dark:hover:bg-white/5"
          >
            Hủy chỉnh vị trí
          </button>
        </div>
        <PlaceMapPicker
          defaultLocationName={locationName}
          defaultCity={city}
          defaultCountry={country}
          defaultLatitude={latitude}
          defaultLongitude={longitude}
        />
      </div>
    );
  }

  return (
    <>
      <input type="hidden" name="location_name" value={locationName} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="country" value={country} />
      <input type="hidden" name="latitude" value={latitude} />
      <input type="hidden" name="longitude" value={longitude} />

      <div className="rounded-2xl border border-mocha/10 bg-blush/50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-mocha/85 dark:text-white/75">
              <MapPin className="h-4 w-4" />
              Vị trí đã lưu
            </p>
            <p className="mt-2 text-sm text-mocha/75 dark:text-white/60">
              {locationName || "Chưa có tên địa điểm"}
            </p>
            <p className="mt-1 text-xs text-mocha/60 dark:text-white/45">
              {[city, country].filter(Boolean).join(" • ") || "Chưa có thành phố / quốc gia"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-mocha/15 bg-white px-3 py-1.5 text-xs font-medium text-mocha/80 hover:bg-white/80 dark:border-white/10 dark:bg-white/10 dark:text-white/75 dark:hover:bg-white/15"
          >
            Cập nhật vị trí
          </button>
        </div>
      </div>
    </>
  );
}

