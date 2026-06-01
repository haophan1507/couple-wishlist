import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_TIMEOUT = 5000;

async function fetchWithTimeout(url: URL, userAgent: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept-Language": "vi,en",
        "User-Agent": userAgent,
      },
      cache: "no-store",
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
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
    return NextResponse.json(
      { results: [], error: "Tìm địa điểm bị quá thời gian, vui lòng thử lại." },
      { status: 504 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { results: [], error: "Không thể tìm địa điểm lúc này." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    importance?: number;
    address?: Record<string, string> & { country_code?: string };
  }>;

  const results = data
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

      if (aVietnam !== bVietnam) {
        return bVietnam - aVietnam;
      }

      return b.importance - a.importance;
    })
    .map(({ countryCode: _countryCode, importance: _importance, ...item }) => item);

  return NextResponse.json({ results });
}
