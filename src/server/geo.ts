import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const NOMINATIM_TIMEOUT = 5000;

async function fetchWithTimeout(url: URL, userAgent: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept-Language": "vi,en",
        "User-Agent": userAgent,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export const searchLocationsFn = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string() }))
  .handler(async ({ data }) => {
    const query = data.q.trim();
    if (query.length < 2) {
      return { results: [] as const };
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "8");

    let response: Response;
    try {
      response = await fetchWithTimeout(
        url,
        "couple-wishlist/1.0 (location search)",
      );
    } catch {
      throw new Error("Tìm địa điểm bị quá thời gian, vui lòng thử lại.");
    }

    if (!response.ok) {
      throw new Error("Không thể tìm địa điểm lúc này.");
    }

    const raw = (await response.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      importance?: number;
      address?: Record<string, string> & { country_code?: string };
    }>;

    const results = raw
      .map((item) => ({
        displayName: item.display_name,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        city:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.state ||
          "",
        country: item.address?.country || "",
        countryCode: item.address?.country_code?.toLowerCase() || "",
        importance: item.importance ?? 0,
      }))
      .sort((a, b) => {
        const aVietnam = a.countryCode === "vn" ? 1 : 0;
        const bVietnam = b.countryCode === "vn" ? 1 : 0;
        if (aVietnam !== bVietnam) return bVietnam - aVietnam;
        return b.importance - a.importance;
      })
      .map(({ countryCode: _c, importance: _i, ...item }) => item);

    return { results };
  });

export const reverseGeocodeFn = createServerFn({ method: "GET" })
  .validator(
    z.object({
      lat: z.string(),
      lng: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", data.lat);
    url.searchParams.set("lon", data.lng);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");

    let response: Response;
    try {
      response = await fetchWithTimeout(
        url,
        "couple-wishlist/1.0 (reverse geocode)",
      );
    } catch {
      throw new Error("Lấy thông tin địa điểm bị quá thời gian, vui lòng thử lại.");
    }

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin địa điểm lúc này.");
    }

    const payload = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    return {
      locationName: payload.display_name || "",
      city:
        payload.address?.city ||
        payload.address?.town ||
        payload.address?.village ||
        payload.address?.state ||
        "",
      country: payload.address?.country || "",
    };
  });
