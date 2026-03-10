"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

function createPickerIcon() {
  return L.divIcon({
    html: "<div style='display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#d96a7b;color:white;box-shadow:0 8px 20px rgba(217,106,123,.35);font-size:16px;'>❤</div>",
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function RecenterMap({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      map.flyTo([latitude, longitude], Math.max(map.getZoom(), 8), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [latitude, longitude, map]);

  return null;
}

function ClickHandler({
  onPick,
}: {
  onPick: (coords: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

export function PlaceMapCanvas({
  center,
  zoom,
  latitude,
  longitude,
  tileUrl,
  attribution,
  onTileError,
  onPick,
}: {
  center: [number, number];
  zoom: number;
  latitude: number | null;
  longitude: number | null;
  tileUrl: string;
  attribution: string;
  onTileError: () => void;
  onPick: (coords: { latitude: number; longitude: number }) => void;
}) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-[320px] w-full">
      <TileLayer
        attribution={attribution}
        url={tileUrl}
        eventHandlers={{
          tileerror: onTileError,
        }}
      />
      <RecenterMap latitude={latitude} longitude={longitude} />
      <ClickHandler onPick={onPick} />
      {typeof latitude === "number" && typeof longitude === "number" ? (
        <Marker
          position={[latitude, longitude]}
          icon={createPickerIcon()}
          draggable
          eventHandlers={{
            dragend(event) {
              const marker = event.target;
              const position = marker.getLatLng();
              onPick({
                latitude: Number(position.lat.toFixed(6)),
                longitude: Number(position.lng.toFixed(6)),
              });
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}

