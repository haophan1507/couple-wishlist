"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LoaderCircle, MapPin, Search } from "lucide-react";
import L from "leaflet";

type SearchResult = {
  displayName: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
};

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

export function PlaceMapPicker({
  defaultLocationName,
  defaultCity,
  defaultCountry,
  defaultLatitude,
  defaultLongitude,
}: {
  defaultLocationName?: string;
  defaultCity?: string;
  defaultCountry?: string;
  defaultLatitude?: string;
  defaultLongitude?: string;
}) {
  const abortRef = useRef<AbortController | null>(null);
  const initialLatitude =
    defaultLatitude && !Number.isNaN(Number(defaultLatitude))
      ? Number(defaultLatitude)
      : null;
  const initialLongitude =
    defaultLongitude && !Number.isNaN(Number(defaultLongitude))
      ? Number(defaultLongitude)
      : null;
  const [latitude, setLatitude] = useState<number | null>(initialLatitude);
  const [longitude, setLongitude] = useState<number | null>(initialLongitude);
  const [locationName, setLocationName] = useState(defaultLocationName ?? "");
  const [city, setCity] = useState(defaultCity ?? "");
  const [country, setCountry] = useState(defaultCountry ?? "");
  const [searchQuery, setSearchQuery] = useState(defaultLocationName ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const center = useMemo<[number, number]>(
    () =>
      typeof latitude === "number" && typeof longitude === "number"
        ? [latitude, longitude]
        : [16.047079, 108.20623],
    [latitude, longitude],
  );

  const runSearch = async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearching(true);
    setSearchError(null);
    setShowResults(true);

    try {
      const response = await fetch(
        `/api/location-search?q=${encodeURIComponent(trimmedQuery)}`,
        { signal: controller.signal },
      );
      const payload = (await response.json()) as {
        results?: SearchResult[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Không thể tìm địa điểm.");
      }

      setResults(payload.results ?? []);
      setShowResults(true);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      setSearchError("Không thể tìm địa điểm lúc này.");
      setResults([]);
      setShowResults(true);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void runSearch(trimmedQuery);
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const reverseGeocode = async (
    nextLatitude: number,
    nextLongitude: number,
  ) => {
    try {
      const response = await fetch(
        `/api/reverse-geocode?lat=${nextLatitude}&lng=${nextLongitude}`,
      );
      const payload = (await response.json()) as {
        locationName?: string;
        city?: string;
        country?: string;
      };

      if (!response.ok) {
        return;
      }

      if (payload.locationName) {
        setLocationName(payload.locationName);
        setSearchQuery(payload.locationName);
      }

      if (payload.city) {
        setCity(payload.city);
      }

      if (payload.country) {
        setCountry(payload.country);
      }
    } catch {
      // Keep current values if reverse geocoding fails.
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-mocha/80 dark:text-white/70">
            Chọn vị trí trên bản đồ
          </p>
          <p className="mt-1 text-xs text-mocha/60 dark:text-white/45">
            Tìm địa điểm, bấm lên bản đồ hoặc kéo marker để cập nhật tọa độ,
            thành phố và quốc gia.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLatitude(null);
            setLongitude(null);
            setResults([]);
            setSearchError(null);
            setShowResults(false);
          }}
          className="rounded-full border border-mocha/15 px-3 py-1.5 text-xs text-mocha/70 hover:bg-white dark:border-white/10 dark:text-white/65 dark:hover:bg-white/5"
        >
          Xóa tọa độ
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-full border border-mocha/12 bg-white/92 px-5 py-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/8">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blush/80 dark:bg-white/10">
              <Search className="h-4 w-4 text-mocha/55 dark:text-white/60" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchError(null);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void runSearch(searchQuery);
                }
              }}
              placeholder="Tìm địa điểm để thả tim lên bản đồ"
              className="block w-full placeholder:text-mocha/45 dark:placeholder:text-white/35"
              style={{
                all: "unset",
                display: "block",
                width: "100%",
                fontSize: "15px",
                lineHeight: "1.35",
                color: "inherit",
                caretColor: "#d96a7b",
              }}
            />
            {searching ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-mocha/50 dark:text-white/50" />
            ) : null}
          </div>

          {showResults ? (
            <div
              className="max-h-72 overflow-y-auto overscroll-contain rounded-[1.5rem] border border-mocha/10 bg-white/96 shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#241f22]/96"
              onWheelCapture={(event) => event.stopPropagation()}
              onTouchMoveCapture={(event) => event.stopPropagation()}
            >
              {searchError ? (
                <p className="px-3 py-3 text-sm text-rose-700 dark:text-rose-300">
                  {searchError}
                </p>
              ) : null}
              {!searching &&
              !searchError &&
              searchQuery.trim().length >= 2 &&
              !results.length ? (
                <p className="px-3 py-3 text-sm text-mocha/65 dark:text-white/55">
                  Không tìm thấy kết quả phù hợp.
                </p>
              ) : null}
              {results.map((result) => (
                <button
                  key={`${result.latitude}-${result.longitude}-${result.displayName}`}
                  type="button"
                  onClick={() => {
                    setLocationName(result.displayName);
                    setSearchQuery(result.displayName);
                    setCity(result.city);
                    setCountry(result.country);
                    setLatitude(Number(result.latitude.toFixed(6)));
                    setLongitude(Number(result.longitude.toFixed(6)));
                    setShowResults(false);
                  }}
                  className="flex w-full items-start gap-3 border-t border-mocha/8 px-4 py-3 text-left transition first:border-t-0 hover:bg-blush/60 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush/80 dark:bg-white/10">
                    <MapPin className="h-4 w-4 text-rose" />
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium dark:text-white">
                      {result.displayName}
                    </span>
                    <span className="mt-1 block text-xs text-mocha/60 dark:text-white/45">
                      {result.city || "Chưa rõ thành phố"}
                      {result.country ? ` • ${result.country}` : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm font-medium text-mocha/80 dark:text-white/70">
              Bản đồ chọn điểm
            </p>
            <p className="text-xs text-mocha/55 dark:text-white/45">
              Cuộn chuột để zoom, kéo marker để chỉnh
            </p>
          </div>

          <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-white/70 dark:border-white/10">
            <MapContainer
              center={center}
              zoom={initialLatitude && initialLongitude ? 8 : 5}
              scrollWheelZoom
              className="h-[320px] w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; Wikimedia Maps'
                url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=vi"
              />
              <RecenterMap latitude={latitude} longitude={longitude} />
              <ClickHandler
                onPick={(coords) => {
                  setLatitude(coords.latitude);
                  setLongitude(coords.longitude);
                  void reverseGeocode(coords.latitude, coords.longitude);
                }}
              />
              {typeof latitude === "number" && typeof longitude === "number" ? (
                <Marker
                  position={[latitude, longitude]}
                  icon={createPickerIcon()}
                  draggable
                  eventHandlers={{
                    dragend(event) {
                      const marker = event.target;
                      const position = marker.getLatLng();
                      const nextLatitude = Number(position.lat.toFixed(6));
                      const nextLongitude = Number(position.lng.toFixed(6));
                      setLatitude(nextLatitude);
                      setLongitude(nextLongitude);
                      void reverseGeocode(nextLatitude, nextLongitude);
                    },
                  }}
                />
              ) : null}
            </MapContainer>
          </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          name="location_name"
          placeholder="Tên địa điểm"
          value={locationName}
          onChange={(event) => setLocationName(event.target.value)}
          required
        />
        <input
          name="city"
          placeholder="Thành phố"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
        <input
          name="country"
          placeholder="Quốc gia"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
        />
      </div>

      <input type="hidden" name="latitude" value={latitude ?? ""} readOnly />
      <input type="hidden" name="longitude" value={longitude ?? ""} readOnly />

      <div className="rounded-2xl border border-dashed border-mocha/15 bg-white/60 px-4 py-3 text-sm text-mocha/65 dark:border-white/10 dark:bg-white/5 dark:text-white/55">
        {typeof latitude === "number" && typeof longitude === "number" ? (
          <span>
            Tọa độ đã chọn: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        ) : (
          <span>Chưa chọn tọa độ trên bản đồ.</span>
        )}
      </div>
    </div>
  );
}
