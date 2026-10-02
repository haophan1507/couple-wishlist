import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { LoaderCircle, MapPin, Search } from "lucide-react";
import { reverseGeocodeFn, searchLocationsFn } from "@/src/server/geo";

const WIKIMEDIA_TILE_URL = "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=vi";
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const DynamicPlaceMapCanvas = lazy(() =>
  import("@/components/admin/place-map-canvas").then((mod) => ({
    default: mod.PlaceMapCanvas,
  })),
);

type SearchResult = {
  displayName: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
};

type PickerState = {
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  city: string;
  country: string;
  searchQuery: string;
  results: SearchResult[];
  searching: boolean;
  searchError: string | null;
  showResults: boolean;
  useFallbackTile: boolean;
};

type PickerAction =
  | { type: "query-changed"; query: string }
  | { type: "search-cleared" }
  | { type: "search-started" }
  | { type: "search-succeeded"; results: SearchResult[] }
  | { type: "search-failed"; message: string }
  | { type: "search-finished" }
  | { type: "result-selected"; result: SearchResult }
  | { type: "coordinates-cleared" }
  | { type: "map-picked"; latitude: number; longitude: number }
  | { type: "geocoded"; locationName?: string; city?: string; country?: string }
  | { type: "location-name-changed"; value: string }
  | { type: "city-changed"; value: string }
  | { type: "country-changed"; value: string }
  | { type: "results-shown" }
  | { type: "tile-failed" };

function pickerReducer(state: PickerState, action: PickerAction): PickerState {
  switch (action.type) {
    case "query-changed":
      return {
        ...state,
        searchQuery: action.query,
        searchError: null,
        showResults: true,
        results: action.query.trim().length < 2 ? [] : state.results,
      };
    case "search-cleared":
      return { ...state, results: [], searchError: null };
    case "search-started":
      return { ...state, searching: true, searchError: null, showResults: true };
    case "search-succeeded":
      return { ...state, results: action.results, showResults: true };
    case "search-failed":
      return { ...state, searchError: action.message, results: [], showResults: true };
    case "search-finished":
      return { ...state, searching: false };
    case "result-selected":
      return {
        ...state,
        locationName: action.result.displayName,
        searchQuery: action.result.displayName,
        city: action.result.city,
        country: action.result.country,
        latitude: Number(action.result.latitude.toFixed(6)),
        longitude: Number(action.result.longitude.toFixed(6)),
        showResults: false,
      };
    case "coordinates-cleared":
      return {
        ...state,
        latitude: null,
        longitude: null,
        results: [],
        searchError: null,
        showResults: false,
      };
    case "map-picked":
      return { ...state, latitude: action.latitude, longitude: action.longitude };
    case "geocoded":
      return {
        ...state,
        locationName: action.locationName || state.locationName,
        searchQuery: action.locationName || state.searchQuery,
        city: action.city || state.city,
        country: action.country || state.country,
      };
    case "location-name-changed":
      return { ...state, locationName: action.value };
    case "city-changed":
      return { ...state, city: action.value };
    case "country-changed":
      return { ...state, country: action.value };
    case "results-shown":
      return { ...state, showResults: true };
    case "tile-failed":
      return { ...state, useFallbackTile: true };
    default:
      return state;
  }
}

function PlaceSearchPanel({
  searchQuery,
  searching,
  searchError,
  showResults,
  results,
  onQueryChange,
  onFocus,
  onSubmitSearch,
  onSelectResult,
}: {
  searchQuery: string;
  searching: boolean;
  searchError: string | null;
  showResults: boolean;
  results: SearchResult[];
  onQueryChange: (query: string) => void;
  onFocus: () => void;
  onSubmitSearch: () => void;
  onSelectResult: (result: SearchResult) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-mocha/80 dark:text-white/70">Tìm địa điểm</span>
        <div className="flex items-center gap-3 rounded-xl border border-mocha/15 bg-white/92 px-5 py-3 shadow-soft backdrop-blur-sm dark:border-white/10 dark:bg-white/8">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blush/80 dark:bg-white/10">
            <Search className="h-4 w-4 text-muted-foreground dark:text-white/60" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            onFocus={onFocus}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmitSearch();
              }
            }}
            placeholder="Ví dụ: Hồ Tây, Đà Lạt"
            className="block w-full placeholder:text-muted-foreground dark:placeholder:text-white/35"
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
            <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground dark:text-white/50" />
          ) : null}
        </div>
      </label>

      {showResults ? (
        <div
          className="max-h-72 overflow-y-auto overscroll-contain rounded-3xl border border-mocha/10 bg-white/96 shadow-soft backdrop-blur-sm dark:border-white/10 dark:bg-[#241f22]/96"
          onWheelCapture={(event) => event.stopPropagation()}
          onTouchMoveCapture={(event) => event.stopPropagation()}
        >
          {searchError ? (
            <p className="px-3 py-3 text-sm text-rose-700 dark:text-rose-300">{searchError}</p>
          ) : null}
          {!searching && !searchError && searchQuery.trim().length >= 2 && !results.length ? (
            <p className="px-3 py-3 text-sm text-muted-foreground dark:text-white/55">
              Không tìm thấy kết quả phù hợp.
            </p>
          ) : null}
          {results.map((result) => (
            <button
              key={`${result.latitude}-${result.longitude}-${result.displayName}`}
              type="button"
              onClick={() => onSelectResult(result)}
              className="flex w-full items-start gap-3 border-t border-mocha/8 px-4 py-3 text-left transition first:border-t-0 hover:bg-blush/60 dark:border-white/10 dark:hover:bg-white/5"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush/80 dark:bg-white/10">
                <MapPin className="h-4 w-4 text-rose" />
              </div>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium dark:text-white">
                  {result.displayName}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground dark:text-white/45">
                  {result.city || "Chưa rõ thành phố"}
                  {result.country ? ` • ${result.country}` : ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PlaceLocationFields({
  locationName,
  city,
  country,
  onLocationNameChange,
  onCityChange,
  onCountryChange,
}: {
  locationName: string;
  city: string;
  country: string;
  onLocationNameChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-mocha/80 dark:text-white/70">Tên địa điểm</span>
        <input
          name="location_name"
          placeholder="Ví dụ: Hồ Xuân Hương"
          value={locationName}
          onChange={(event) => onLocationNameChange(event.target.value)}
          required
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-mocha/80 dark:text-white/70">Thành phố</span>
        <input
          name="city"
          placeholder="Ví dụ: Đà Lạt"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-mocha/80 dark:text-white/70">Quốc gia</span>
        <input
          name="country"
          placeholder="Ví dụ: Việt Nam"
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
        />
      </label>
    </div>
  );
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
    defaultLatitude && !Number.isNaN(Number(defaultLatitude)) ? Number(defaultLatitude) : null;
  const initialLongitude =
    defaultLongitude && !Number.isNaN(Number(defaultLongitude)) ? Number(defaultLongitude) : null;
  const [state, dispatch] = useReducer(pickerReducer, {
    latitude: initialLatitude,
    longitude: initialLongitude,
    locationName: defaultLocationName ?? "",
    city: defaultCity ?? "",
    country: defaultCountry ?? "",
    searchQuery: defaultLocationName ?? "",
    results: [],
    searching: false,
    searchError: null,
    showResults: false,
    useFallbackTile: false,
  });

  const center = useMemo<[number, number]>(
    () =>
      typeof state.latitude === "number" && typeof state.longitude === "number"
        ? [state.latitude, state.longitude]
        : [16.047079, 108.20623],
    [state.latitude, state.longitude],
  );

  const runSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      dispatch({ type: "search-cleared" });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: "search-started" });

    try {
      const payload = await searchLocationsFn({
        data: { q: trimmedQuery },
      });

      dispatch({ type: "search-succeeded", results: payload.results ?? [] });
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      dispatch({
        type: "search-failed",
        message: error instanceof Error ? error.message : "Không thể tìm địa điểm lúc này.",
      });
    } finally {
      dispatch({ type: "search-finished" });
    }
  }, []);

  useEffect(() => {
    const trimmedQuery = state.searchQuery.trim();

    if (trimmedQuery.length < 2) {
      abortRef.current?.abort();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void runSearch(trimmedQuery);
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state.searchQuery, runSearch]);

  const reverseGeocode = async (nextLatitude: number, nextLongitude: number) => {
    try {
      const payload = await reverseGeocodeFn({
        data: {
          lat: String(nextLatitude),
          lng: String(nextLongitude),
        },
      });

      dispatch({
        type: "geocoded",
        locationName: payload.locationName || undefined,
        city: payload.city || undefined,
        country: payload.country || undefined,
      });
    } catch {
      // Ignore reverse geocode failures; coordinates still work.
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-mocha/80 dark:text-white/70">
            Chọn vị trí trên bản đồ
          </p>
          <p className="mt-1 text-xs text-muted-foreground dark:text-white/45">
            Tìm địa điểm, bấm lên bản đồ hoặc kéo marker để cập nhật tọa độ, thành phố và quốc gia.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "coordinates-cleared" })}
          className="rounded-lg border border-mocha/15 px-3 py-1.5 text-xs text-muted-foreground hover:bg-white dark:border-white/10 dark:text-white/65 dark:hover:bg-white/5"
        >
          Xóa tọa độ
        </button>
      </div>

      <div className="space-y-4">
        <PlaceSearchPanel
          searchQuery={state.searchQuery}
          searching={state.searching}
          searchError={state.searchError}
          showResults={state.showResults}
          results={state.results}
          onQueryChange={(query) => {
            if (query.trim().length < 2) {
              abortRef.current?.abort();
            }
            dispatch({ type: "query-changed", query });
          }}
          onFocus={() => dispatch({ type: "results-shown" })}
          onSubmitSearch={() => void runSearch(state.searchQuery)}
          onSelectResult={(result) => dispatch({ type: "result-selected", result })}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm font-medium text-mocha/80 dark:text-white/70">Bản đồ chọn điểm</p>
            <p className="text-xs text-muted-foreground dark:text-white/45">
              Cuộn chuột để zoom, kéo marker để chỉnh
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/70 dark:border-white/10">
              <Suspense
                fallback={
                  <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground dark:text-white/45">
                    Đang tải bản đồ...
                  </div>
                }
              >
                <DynamicPlaceMapCanvas
                  center={center}
                  zoom={initialLatitude && initialLongitude ? 8 : 5}
                  latitude={state.latitude}
                  longitude={state.longitude}
                  tileUrl={state.useFallbackTile ? OSM_TILE_URL : WIKIMEDIA_TILE_URL}
                  attribution={
                    state.useFallbackTile
                      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; Wikimedia Maps'
                  }
                  onTileError={() => dispatch({ type: "tile-failed" })}
                  onPick={(coords) => {
                    dispatch({
                      type: "map-picked",
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                    });
                    void reverseGeocode(coords.latitude, coords.longitude);
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <PlaceLocationFields
        locationName={state.locationName}
        city={state.city}
        country={state.country}
        onLocationNameChange={(value) => dispatch({ type: "location-name-changed", value })}
        onCityChange={(value) => dispatch({ type: "city-changed", value })}
        onCountryChange={(value) => dispatch({ type: "country-changed", value })}
      />

      <input type="hidden" name="latitude" value={state.latitude ?? ""} readOnly />
      <input type="hidden" name="longitude" value={state.longitude ?? ""} readOnly />

      <div className="rounded-xl border border-dashed border-mocha/15 bg-white/60 px-4 py-3 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/55">
        {typeof state.latitude === "number" && typeof state.longitude === "number" ? (
          <span>
            Tọa độ đã chọn: {state.latitude.toFixed(6)}, {state.longitude.toFixed(6)}
          </span>
        ) : (
          <span>Chưa chọn tọa độ trên bản đồ.</span>
        )}
      </div>
    </div>
  );
}
