import { differenceInCalendarDays, isAfter, startOfDay } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CoupleProfile = Database["public"]["Tables"]["couple_profile"]["Row"];
type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];
type SpecialDay = Database["public"]["Tables"]["special_days"]["Row"];
type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];

export async function getCoupleProfile() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("couple_profile").select("*").limit(1).maybeSingle();
  return (data as CoupleProfile | null) ?? null;
}

export async function getWishlistItems(filters?: {
  category?: string;
  query?: string;
  ownerType?: "me" | "honey";
}) {
  const supabase = await createSupabaseServerClient();
  let request = supabase
    .from("wishlist_items")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.ownerType) {
    request = request.eq("owner_type", filters.ownerType);
  }

  if (filters?.category) {
    request = request.eq("category", filters.category);
  }

  if (filters?.query) {
    request = request.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }

  const { data } = await request;
  const safeData = (data as WishlistItem[] | null) ?? [];

  return safeData.map((item) => ({
    ...item,
    is_gifted: item.status === "gifted"
  }));
}

export async function getWishlistCategories() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("wishlist_items").select("category").not("category", "is", null);
  const categories = ((data as Array<{ category: string | null }> | null) ?? [])
    .map((item) => item.category)
    .filter(Boolean) as string[];

  return [...new Set(categories)];
}

export async function getSpecialDays() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("special_days").select("*").order("date", { ascending: true });
  return (data as SpecialDay[] | null) ?? [];
}

export function getUpcomingDay(days: SpecialDay[]) {
  const today = startOfDay(new Date());

  const upcoming = days
    .map((day) => {
      const currentYear = new Date(`${new Date().getFullYear()}-${day.date.slice(5)}`);
      const nextDate = isAfter(today, currentYear)
        ? new Date(`${new Date().getFullYear() + 1}-${day.date.slice(5)}`)
        : currentYear;

      return {
        ...day,
        upcomingDate: nextDate,
        countdown: differenceInCalendarDays(nextDate, today)
      };
    })
    .sort((a, b) => a.countdown - b.countdown)[0];

  return upcoming;
}

export async function getGalleryItems() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .order("memory_date", { ascending: false })
    .order("created_at", { ascending: false });
  return (data as GalleryItem[] | null) ?? [];
}

export function getDaysTogether(days: SpecialDay[]) {
  const reference = days.find((day) => day.type === "relationship");
  if (!reference) {
    return null;
  }

  return differenceInCalendarDays(startOfDay(new Date()), startOfDay(new Date(reference.date)));
}

export type PublicWishlistItem = Awaited<ReturnType<typeof getWishlistItems>>[number];
