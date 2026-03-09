"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { PlaceMemoryEntry } from "@/lib/data/queries";
import { cn } from "@/lib/utils/cn";

function createMarkerIcon(status: "visited" | "planned") {
  const style =
    status === "visited"
      ? "display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:#d96a7b;color:white;box-shadow:0 8px 20px rgba(217,106,123,.35);font-size:16px;"
      : "display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:rgba(255,255,255,.82);color:#6c5960;box-shadow:0 4px 12px rgba(0,0,0,.12);border:1px solid rgba(108,89,96,.18);font-size:16px;";

  return L.divIcon({
    html: `<div style="${style}">❤</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FitBounds({ places }: { places: PlaceMemoryEntry[] }) {
  const map = useMap();

  useEffect(() => {
    const validPlaces = places.filter(
      (place) => typeof place.latitude === "number" && typeof place.longitude === "number",
    );

    if (!validPlaces.length) {
      map.setView([16.047079, 108.20623], 5);
      return;
    }

    if (validPlaces.length === 1) {
      map.setView([validPlaces[0].latitude!, validPlaces[0].longitude!], 10);
      return;
    }

    map.fitBounds(
      validPlaces.map((place) => [place.latitude!, place.longitude!] as [number, number]),
      { padding: [40, 40] },
    );
  }, [map, places]);

  return null;
}

export function RealMapView({
  places,
  selectedPlaceId,
  onSelect,
  className,
}: {
  places: PlaceMemoryEntry[];
  selectedPlaceId: string | null;
  onSelect: (placeId: string) => void;
  className?: string;
}) {
  const points = places.filter(
    (place) => typeof place.latitude === "number" && typeof place.longitude === "number",
  );

  return (
    <div
      className={cn(
        "relative h-[520px] overflow-hidden rounded-[2rem] border border-white/70 md:h-[620px] xl:h-[700px] dark:border-white/10",
        className,
      )}
    >
      <MapContainer
        center={[16.047079, 108.20623]}
        zoom={5}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; Wikimedia Maps'
          url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=vi"
        />
        <FitBounds places={points} />
        {points.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude!, place.longitude!]}
            icon={createMarkerIcon(place.status)}
            eventHandlers={{
              click: () => onSelect(place.id),
            }}
            opacity={place.status === "planned" ? 0.65 : 1}
          />
        ))}
      </MapContainer>
      {!points.length ? (
        <div className="absolute inset-0 flex items-center justify-center bg-cream/80 text-sm text-mocha/65 dark:bg-[#1e1a1c]/80 dark:text-white/55">
          Chưa có địa điểm nào có tọa độ để hiển thị trên bản đồ.
        </div>
      ) : null}
      {selectedPlaceId ? <span className="sr-only">{selectedPlaceId}</span> : null}
    </div>
  );
}
