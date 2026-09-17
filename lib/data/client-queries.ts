import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicStorageUrl } from "@/lib/storage/public-url";
import { parseWishlistProductUrls } from "@/lib/utils/wishlist-links";
import type { Database } from "@/types/database";

type CoupleProfile = Database["public"]["Tables"]["couple_profile"]["Row"];
type SpecialDay = Database["public"]["Tables"]["special_days"]["Row"];
type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];

function escapePostgrestLikeValue(value: string) {
  return value.replace(/[,%()]/g, "");
}

function mapWishlistItem(item: WishlistItem) {
  return {
    ...item,
    image_url: getPublicStorageUrl(item.image_path),
    product_urls: parseWishlistProductUrls(item.product_url),
    is_gifted: item.status === "gifted",
  };
}

export type PublicWishlistItem = ReturnType<typeof mapWishlistItem>;

export const queryKeys = {
  coupleProfile: ["couple-profile"] as const,
  specialDays: ["special-days"] as const,
  wishlistCounts: ["wishlist", "counts"] as const,
  wishlistCategories: ["wishlist", "categories"] as const,
  wishlistPage: (filters: {
    ownerType: "me" | "honey";
    page: number;
    pageSize: number;
    q?: string;
    category?: string;
  }) => ["wishlist", "page", filters] as const,
  adminWishlistPage: (filters: { page: number; pageSize: number }) =>
    ["admin", "wishlist", filters] as const,
  adminSpecialDaysPage: (filters: { page: number; pageSize: number }) =>
    ["admin", "special-days", filters] as const,
  adminGalleryPage: (filters: { page: number; pageSize: number }) =>
    ["admin", "gallery", filters] as const,
  adminGiftHistoryPage: (filters: { page: number; pageSize: number }) =>
    ["admin", "gift-history", filters] as const,
  adminPlacesPage: (filters: { page: number; pageSize: number }) =>
    ["admin", "places", filters] as const,
  adminCounts: ["admin", "counts"] as const,
  wishlistOptions: ["wishlist", "options"] as const,
  giftHistory: (filters: { page?: number }) =>
    ["gift-history", filters] as const,
  giftHistoryStats: ["gift-history", "stats"] as const,
  gallery: (filters: { page?: number }) => ["gallery", filters] as const,
  places: ["places"] as const,
};

export async function fetchCoupleProfile() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("couple_profile")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const profile = (data as CoupleProfile | null) ?? null;
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    cover_image_url: getPublicStorageUrl(profile.cover_image_path),
  };
}

export async function fetchSpecialDays() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("special_days")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as SpecialDay[] | null) ?? [];
}

export async function fetchWishlistOwnerCounts() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("owner_type, status");

  if (error) {
    throw error;
  }

  const items =
    (data as Array<Pick<WishlistItem, "owner_type" | "status">> | null) ?? [];

  const summarize = (ownerType: "me" | "honey") => {
    const owned = items.filter((item) => item.owner_type === ownerType);
    return {
      count: owned.length,
      giftedCount: owned.filter((item) => item.status === "gifted").length,
    };
  };

  return {
    me: summarize("me"),
    honey: summarize("honey"),
  };
}

export async function fetchWishlistCategories() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("category")
    .not("category", "is", null);

  if (error) {
    throw error;
  }

  const categories = (
    (data as Array<{ category: string | null }> | null) ?? []
  ).flatMap((item) => (item.category ? [item.category] : []));

  return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
}

export async function fetchWishlistPage(filters: {
  ownerType: "me" | "honey";
  page: number;
  pageSize: number;
  category?: string;
  query?: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let request = supabase
    .from("wishlist_items")
    .select("*", { count: "exact", head: false })
    .eq("owner_type", filters.ownerType)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.category) {
    request = request.eq("category", filters.category);
  }

  if (filters.query) {
    const safeQuery = escapePostgrestLikeValue(filters.query.trim());
    if (safeQuery) {
      request = request.or(
        `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`,
      );
    }
  }

  const { data, error, count } = await request.range(from, to);

  if (error) {
    throw error;
  }

  const items = ((data as WishlistItem[] | null) ?? []).map(mapWishlistItem);
  return { items, total: count ?? items.length };
}

export async function fetchAdminWishlistPage(page: number, pageSize: number) {
  const supabase = createSupabaseBrowserClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("wishlist_items")
    .select("*", { count: "exact", head: false })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const items = ((data as WishlistItem[] | null) ?? []).map(mapWishlistItem);
  return { items, total: count ?? items.length };
}

export async function fetchWishlistOptions() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, title, owner_type")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (
    (data as Array<Pick<WishlistItem, "id" | "title" | "owner_type">> | null) ??
    []
  );
}

export async function fetchAdminSpecialDaysPage(page: number, pageSize: number) {
  const days = await fetchSpecialDays();
  const total = days.length;
  const from = (page - 1) * pageSize;
  return { items: days.slice(from, from + pageSize), total };
}

export async function fetchAdminGalleryPage(page: number, pageSize: number) {
  return fetchGalleryPage(page, pageSize);
}

export async function fetchAdminGiftHistoryPage(page: number, pageSize: number) {
  return fetchGiftHistoryPage(page, pageSize);
}

export async function fetchAdminPlacesPage(page: number, pageSize: number) {
  const places = await fetchPlaceMemories();
  const total = places.length;
  const from = (page - 1) * pageSize;
  return { items: places.slice(from, from + pageSize), total };
}

export async function fetchAdminCounts() {
  const supabase = createSupabaseBrowserClient();
  const [wishlist, specialDays, gallery, giftHistory, places] =
    await Promise.all([
      supabase.from("wishlist_items").select("*", { count: "exact", head: true }),
      supabase.from("special_days").select("*", { count: "exact", head: true }),
      supabase.from("gallery_items").select("*", { count: "exact", head: true }),
      supabase
        .from("gift_history_items")
        .select("*", { count: "exact", head: true }),
      supabase.from("place_memories").select("*", { count: "exact", head: true }),
    ]);

  return {
    wishlist: wishlist.count ?? 0,
    specialDays: specialDays.count ?? 0,
    gallery: gallery.count ?? 0,
    giftHistory: giftHistory.count ?? 0,
    places: places.count ?? 0,
  };
}

type GiftHistoryItem = Database["public"]["Tables"]["gift_history_items"]["Row"];
type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];
type PlaceMemory = Database["public"]["Tables"]["place_memories"]["Row"];
type PlaceMemoryImage = Database["public"]["Tables"]["place_memory_images"]["Row"];

function mapGiftHistoryItem(
  item: GiftHistoryItem,
  dayMap: Map<string, Pick<SpecialDay, "id" | "title" | "date">>,
  wishlistMap: Map<string, Pick<WishlistItem, "id" | "title" | "owner_type">>,
) {
  return {
    ...item,
    photo_url: getPublicStorageUrl(item.photo_path),
    special_day: item.special_day_id ? dayMap.get(item.special_day_id) ?? null : null,
    wishlist_item: item.wishlist_item_id
      ? wishlistMap.get(item.wishlist_item_id) ?? null
      : null,
  };
}

export type GiftHistoryEntry = ReturnType<typeof mapGiftHistoryItem>;

export async function fetchGiftHistoryStats() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("gift_history_items")
    .select("status, recipient_owner_type, photo_path");

  if (error) throw error;

  const items =
    (data as Array<
      Pick<GiftHistoryItem, "status" | "recipient_owner_type" | "photo_path">
    > | null) ?? [];

  return {
    total: items.length,
    withPhotoCount: items.filter((item) => item.photo_path).length,
    thankedCount: items.filter((item) => item.status === "thanked").length,
    meCount: items.filter((item) => item.recipient_owner_type === "me").length,
    honeyCount: items.filter((item) => item.recipient_owner_type === "honey")
      .length,
  };
}

export async function fetchGiftHistoryPage(page: number, pageSize: number) {
  const supabase = createSupabaseBrowserClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("gift_history_items")
    .select("*", { count: "exact", head: false })
    .order("received_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const pageItems = (data as GiftHistoryItem[] | null) ?? [];
  const dayIds = [
    ...new Set(
      pageItems.flatMap((item) =>
        item.special_day_id ? [item.special_day_id] : [],
      ),
    ),
  ];
  const wishlistIds = [
    ...new Set(
      pageItems.flatMap((item) =>
        item.wishlist_item_id ? [item.wishlist_item_id] : [],
      ),
    ),
  ];

  const [daysResult, wishlistResult] = await Promise.all([
    dayIds.length
      ? supabase.from("special_days").select("id, title, date").in("id", dayIds)
      : Promise.resolve({ data: [], error: null }),
    wishlistIds.length
      ? supabase
          .from("wishlist_items")
          .select("id, title, owner_type")
          .in("id", wishlistIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (daysResult.error) throw daysResult.error;
  if (wishlistResult.error) throw wishlistResult.error;

  const dayMap = new Map(
    (
      (daysResult.data as Array<Pick<SpecialDay, "id" | "title" | "date">> | null) ??
      []
    ).map((day) => [day.id, day]),
  );
  const wishlistMap = new Map(
    (
      (wishlistResult.data as Array<
        Pick<WishlistItem, "id" | "title" | "owner_type">
      > | null) ?? []
    ).map((item) => [item.id, item]),
  );

  return {
    items: pageItems.map((item) =>
      mapGiftHistoryItem(item, dayMap, wishlistMap),
    ),
    total: count ?? pageItems.length,
  };
}

function mapGalleryItem(item: GalleryItem) {
  return {
    ...item,
    image_url: getPublicStorageUrl(item.image_path),
  };
}

export type GalleryEntry = ReturnType<typeof mapGalleryItem>;

export async function fetchGalleryPage(page: number, pageSize: number) {
  const supabase = createSupabaseBrowserClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("gallery_items")
    .select("*", { count: "exact", head: false })
    .order("memory_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const items = ((data as GalleryItem[] | null) ?? []).map(mapGalleryItem);
  return { items, total: count ?? items.length };
}

export async function fetchPlaceMemories() {
  const supabase = createSupabaseBrowserClient();
  const [placesResult, imagesResult] = await Promise.all([
    supabase
      .from("place_memories")
      .select("*")
      .order("visit_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("place_memory_images")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
  ]);

  if (placesResult.error) throw placesResult.error;
  if (imagesResult.error) throw imagesResult.error;

  const imageMap = new Map<string, PlaceMemoryImage[]>();
  for (const image of (imagesResult.data as PlaceMemoryImage[] | null) ?? []) {
    const list = imageMap.get(image.place_memory_id) ?? [];
    list.push(image);
    imageMap.set(image.place_memory_id, list);
  }

  return ((placesResult.data as PlaceMemory[] | null) ?? []).map((place) => ({
    ...place,
    cover_image_url: getPublicStorageUrl(place.cover_image_path),
    images: (imageMap.get(place.id) ?? []).map((image) => ({
      ...image,
      image_url: getPublicStorageUrl(image.image_path),
    })),
  }));
}

export type PlaceMemoryEntry = Awaited<
  ReturnType<typeof fetchPlaceMemories>
>[number];

export type { CoupleProfile, SpecialDay };
