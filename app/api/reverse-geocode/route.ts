import { NextRequest, NextResponse } from "next/server";

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
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Thiếu latitude hoặc longitude." },
      { status: 400 },
    );
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");

  let response: Response;
  try {
    response = await fetchWithTimeout(
      url,
      "couple-wishlist/1.0 (reverse geocode)",
    );
  } catch {
    return NextResponse.json(
      { error: "Lấy thông tin địa điểm bị quá thời gian, vui lòng thử lại." },
      { status: 504 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Không thể lấy thông tin địa điểm lúc này." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as {
    display_name?: string;
    address?: Record<string, string>;
  };

  return NextResponse.json({
    locationName: data.display_name || "",
    city:
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.state ||
      "",
    country: data.address?.country || "",
  });
}
