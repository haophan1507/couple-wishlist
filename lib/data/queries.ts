import {
  addDays,
  addYears,
  differenceInCalendarDays,
  differenceInYears,
  endOfMonth,
  eachDayOfInterval,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { getPublicStorageUrl } from "@/lib/storage/public-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CoupleProfile = Database["public"]["Tables"]["couple_profile"]["Row"];
type GiftHistoryItem = Database["public"]["Tables"]["gift_history_items"]["Row"];
type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];
type SpecialDay = Database["public"]["Tables"]["special_days"]["Row"];
type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];
type PlaceMemory = Database["public"]["Tables"]["place_memories"]["Row"];
type PlaceMemoryImage = Database["public"]["Tables"]["place_memory_images"]["Row"];
type TimelineEvent = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  countdown: number;
  source: "manual" | "milestone";
  type: string;
  badge?: string;
};

type MilestoneTarget = {
  dayCount: number;
  title: string;
  description: string;
  date: Date;
};

const AUTO_HOLIDAY_DEFINITIONS = [
  {
    key: "valentine",
    monthDay: "02-14",
    title: "Valentine 14/2",
    description: "Ngày lễ Tình nhân - dịp để gửi lời yêu thương ngọt ngào.",
  },
  {
    key: "womens-day",
    monthDay: "03-08",
    title: "Quốc tế Phụ nữ 8/3",
    description: "Một ngày đặc biệt để gửi lời chúc và sự quan tâm.",
  },
  {
    key: "international-happiness-day",
    monthDay: "03-21",
    title: "Ngày Quốc tế Hạnh phúc 21/3",
    description: "Một ngày để cùng nhau lưu giữ niềm vui và hạnh phúc.",
  },
  {
    key: "girlfriend-day",
    monthDay: "08-01",
    title: "Ngày bạn gái 1/8",
    description: "Dịp để dành những điều dễ thương cho người thương.",
  },
  {
    key: "boyfriend-day",
    monthDay: "10-03",
    title: "Ngày bạn trai 3/10",
    description: "Một ngày nhỏ để nói lời yêu và cảm ơn nửa kia.",
  },
  {
    key: "vn-womens-day",
    monthDay: "10-20",
    title: "Phụ nữ Việt Nam 20/10",
    description: "Ngày tôn vinh phụ nữ Việt Nam với những điều dễ thương.",
  },
  {
    key: "christmas-eve",
    monthDay: "12-24",
    title: "Đêm Giáng Sinh 24/12",
    description: "Đêm ấm áp để hẹn hò và trao nhau quà nhỏ.",
  },
  {
    key: "new-year-day",
    monthDay: "01-01",
    title: "Năm mới 1/1",
    description: "Bắt đầu năm mới cùng nhau với thật nhiều yêu thương.",
  },
] as const;

function getAnnualOccurrence(dateString: string) {
  const today = startOfDay(new Date());
  const thisYear = new Date(`${today.getFullYear()}-${dateString.slice(5)}`);

  if (isAfter(today, thisYear)) {
    return new Date(`${today.getFullYear() + 1}-${dateString.slice(5)}`);
  }

  return thisYear;
}

function getMilestoneTargets(startedAt: Date, daysInLove: number) {
  const horizonDays = Math.max(2000, daysInLove + 1500);
  const horizonDate = addDays(startedAt, horizonDays);
  const milestoneMap = new Map<number, MilestoneTarget>();

  const specialDayMilestones = [99, 500, 999];
  for (const dayCount of specialDayMilestones) {
    const date = addDays(startedAt, dayCount);

    if (date <= horizonDate) {
      milestoneMap.set(dayCount, {
        dayCount,
        title: `${dayCount} ngày yêu nhau`,
        description: `Một mốc số đẹp sau ${dayCount} ngày ở bên nhau.`,
        date,
      });
    }
  }

  for (let dayCount = 1000; dayCount <= horizonDays; dayCount += 500) {
    milestoneMap.set(dayCount, {
      dayCount,
      title: `${dayCount} ngày yêu nhau`,
      description: `Cột mốc đặc biệt ${dayCount} ngày của hai bạn.`,
      date: addDays(startedAt, dayCount),
    });
  }

  for (let year = 1; ; year += 1) {
    const date = addYears(startedAt, year);

    if (date > horizonDate) {
      break;
    }

    const dayCount = differenceInCalendarDays(date, startedAt);
    milestoneMap.set(dayCount, {
      dayCount,
      title: `${year} năm yêu nhau`,
      description: `Kỷ niệm tròn ${year} năm kể từ ngày bắt đầu yêu nhau.`,
      date,
    });
  }

  return [...milestoneMap.values()].sort((a, b) => a.dayCount - b.dayCount);
}

function getAutoHolidayDays(days: SpecialDay[]) {
  const manualHolidayMonthDays = new Set(
    days.filter((day) => day.type === "holiday").map((day) => day.date.slice(5)),
  );

  return AUTO_HOLIDAY_DEFINITIONS.filter(
    (holiday) => !manualHolidayMonthDays.has(holiday.monthDay),
  ).map((holiday) => ({
    id: `auto-holiday-${holiday.key}`,
    title: holiday.title,
    description: holiday.description,
    date: `2000-${holiday.monthDay}`,
    type: "holiday" as const,
    created_at: "2000-01-01T00:00:00.000Z",
  }));
}

export async function getCoupleProfile() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("couple_profile")
    .select("*")
    .limit(1)
    .maybeSingle();
  const profile = (data as CoupleProfile | null) ?? null;

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    cover_image_url: getPublicStorageUrl(profile.cover_image_path),
  };
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
    request = request.or(
      `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`,
    );
  }

  const { data } = await request;
  const safeData = (data as WishlistItem[] | null) ?? [];

  return safeData.map((item) => ({
    ...item,
    image_url: getPublicStorageUrl(item.image_path),
    is_gifted: item.status === "gifted",
  }));
}

export async function getWishlistCategories() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("category")
    .not("category", "is", null);
  const categories = ((data as Array<{ category: string | null }> | null) ?? [])
    .map((item) => item.category)
    .filter(Boolean) as string[];

  return [...new Set(categories)];
}

export async function getSpecialDays() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("special_days")
    .select("*")
    .order("date", { ascending: true });
  return (data as SpecialDay[] | null) ?? [];
}

export function getUpcomingDay(days: SpecialDay[]) {
  const today = startOfDay(new Date());
  const allDays = [...days, ...getAutoHolidayDays(days)];

  const upcoming = allDays
    .map((day) => {
      const currentYear = new Date(
        `${new Date().getFullYear()}-${day.date.slice(5)}`,
      );
      const nextDate = isAfter(today, currentYear)
        ? new Date(`${new Date().getFullYear() + 1}-${day.date.slice(5)}`)
        : currentYear;

      return {
        ...day,
        upcomingDate: nextDate,
        countdown: differenceInCalendarDays(nextDate, today),
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
  return (((data as GalleryItem[] | null) ?? [])).map((item) => ({
    ...item,
    image_url: getPublicStorageUrl(item.image_path),
  }));
}

export async function getGiftHistoryItems() {
  const supabase = await createSupabaseServerClient();
  const [{ data: items }, { data: specialDays }, { data: wishlistItems }] =
    await Promise.all([
      supabase
        .from("gift_history_items")
        .select("*")
        .order("received_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("special_days").select("id, title, date"),
      supabase.from("wishlist_items").select("id, title, owner_type"),
    ]);

  const dayMap = new Map(
    (((specialDays as Array<Pick<SpecialDay, "id" | "title" | "date">> | null) ??
      [])).map((day) => [day.id, day]),
  );
  const wishlistMap = new Map(
    (((wishlistItems as Array<Pick<WishlistItem, "id" | "title" | "owner_type">> | null) ??
      [])).map((item) => [item.id, item]),
  );

  return (((items as GiftHistoryItem[] | null) ?? [])).map((item) => ({
    ...item,
    photo_url: getPublicStorageUrl(item.photo_path),
    special_day: item.special_day_id ? dayMap.get(item.special_day_id) ?? null : null,
    wishlist_item: item.wishlist_item_id
      ? wishlistMap.get(item.wishlist_item_id) ?? null
      : null,
  }));
}

export async function getPlaceMemories() {
  const supabase = await createSupabaseServerClient();
  const [{ data: places }, { data: images }] = await Promise.all([
    supabase
      .from("place_memories")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("visit_date", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("place_memory_images")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
  ]);

  const imageMap = new Map<string, PlaceMemoryImage[]>();
  for (const image of ((images as PlaceMemoryImage[] | null) ?? [])) {
    const list = imageMap.get(image.place_memory_id) ?? [];
    list.push(image);
    imageMap.set(image.place_memory_id, list);
  }

  return (((places as PlaceMemory[] | null) ?? [])).map((place) => ({
    ...place,
    cover_image_url: getPublicStorageUrl(place.cover_image_path),
    images: (imageMap.get(place.id) ?? []).map((image) => ({
      ...image,
      image_url: getPublicStorageUrl(image.image_path),
    })),
  }));
}

export function getLoveStats(loveStartDate: string | null) {
  if (!loveStartDate) {
    return null;
  }

  const today = startOfDay(new Date());
  const startedAt = startOfDay(new Date(loveStartDate));
  const daysInLove = differenceInCalendarDays(today, startedAt);

  const milestones = getMilestoneTargets(startedAt, daysInLove).map((milestone) => {
    return {
      id: `milestone-${milestone.dayCount}`,
      title: milestone.title,
      description: milestone.description,
      date: milestone.date,
      countdown: differenceInCalendarDays(milestone.date, today),
      source: "milestone" as const,
      type: "milestone",
      badge: "Cột mốc",
    };
  });

  const nextMilestone =
    milestones.find((milestone) => milestone.countdown >= 0) ?? null;

  return {
    daysInLove,
    startedAt,
    milestones,
    nextMilestone,
  };
}

function getBirthdayEvents(profile: CoupleProfile | null): TimelineEvent[] {
  if (!profile) {
    return [];
  }

  const entries = [
    {
      name: profile.person_one_name,
      birthday: profile.person_one_birthday,
      favorite: profile.person_one_favorite,
      hobby: profile.person_one_hobby,
      key: "person-one",
    },
    {
      name: profile.person_two_name,
      birthday: profile.person_two_birthday,
      favorite: profile.person_two_favorite,
      hobby: profile.person_two_hobby,
      key: "person-two",
    },
  ];

  return entries
    .filter((entry) => entry.birthday)
    .map((entry) => {
      const nextBirthday = getAnnualOccurrence(entry.birthday!);
      const age = differenceInYears(nextBirthday, new Date(entry.birthday!));
      const pieces = [`Sinh nhật ${age} tuổi`];

      if (entry.favorite) {
        pieces.push(`Yêu thích: ${entry.favorite}`);
      }

      if (entry.hobby) {
        pieces.push(`Sở thích: ${entry.hobby}`);
      }

      return {
        id: `birthday-${entry.key}`,
        title: `Sinh nhật ${entry.name}`,
        description: pieces.join(" • "),
        date: nextBirthday,
        countdown: differenceInCalendarDays(nextBirthday, startOfDay(new Date())),
        source: "manual" as const,
        type: "birthday",
        badge: "Sinh nhật",
      };
    });
}

export function getTimelineEvents(days: SpecialDay[], profile: CoupleProfile | null) {
  const today = startOfDay(new Date());
  const manualEvents: TimelineEvent[] = days.map((day) => {
    const nextDate = getAnnualOccurrence(day.date);

    return {
      id: day.id,
      title: day.title,
      description: day.description,
      date: nextDate,
      countdown: differenceInCalendarDays(nextDate, today),
      source: "manual",
      type: day.type,
      badge: "Tự thêm",
    };
  });
  const autoHolidayEvents: TimelineEvent[] = getAutoHolidayDays(days).map((day) => {
    const nextDate = getAnnualOccurrence(day.date);

    return {
      id: day.id,
      title: day.title,
      description: day.description,
      date: nextDate,
      countdown: differenceInCalendarDays(nextDate, today),
      source: "manual",
      type: day.type,
      badge: "Ngày lễ",
    };
  });

  const loveStats = getLoveStats(profile?.love_start_date ?? null);
  const milestoneEvents = loveStats?.milestones ?? [];
  const birthdayEvents = getBirthdayEvents(profile);

  return [...manualEvents, ...autoHolidayEvents, ...birthdayEvents, ...milestoneEvents].sort(
    (a, b) => a.countdown - b.countdown,
  );
}

export function getLoveCalendar(events: TimelineEvent[], monthDate = new Date()) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const eventMap = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const key = format(event.date, "yyyy-MM-dd");
    const list = eventMap.get(key) ?? [];
    list.push(event);
    eventMap.set(key, list);
  }

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(
    (day) => {
      const key = format(day, "yyyy-MM-dd");
      return {
        date: day,
        inCurrentMonth: isSameMonth(day, monthStart),
        events: eventMap.get(key) ?? [],
        isToday: isSameDay(day, new Date()),
      };
    },
  );
}

export type PublicWishlistItem = Awaited<
  ReturnType<typeof getWishlistItems>
>[number];
export type PlaceMemoryEntry = Awaited<
  ReturnType<typeof getPlaceMemories>
>[number];
export type GiftHistoryEntry = Awaited<
  ReturnType<typeof getGiftHistoryItems>
>[number];
export type LoveTimelineEvent = ReturnType<typeof getTimelineEvents>[number];

export function getCoupleFacts(profile: CoupleProfile | null) {
  if (!profile) {
    return [];
  }

  const people = [
    {
      name: profile.person_one_name,
      birthday: profile.person_one_birthday,
      favorite: profile.person_one_favorite,
      hobby: profile.person_one_hobby,
    },
    {
      name: profile.person_two_name,
      birthday: profile.person_two_birthday,
      favorite: profile.person_two_favorite,
      hobby: profile.person_two_hobby,
    },
  ];

  return people.map((person) => {
    const age = person.birthday
      ? differenceInYears(startOfDay(new Date()), startOfDay(new Date(person.birthday)))
      : null;

    return {
      ...person,
      age,
    };
  });
}
