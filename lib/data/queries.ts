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
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CoupleProfile = Database["public"]["Tables"]["couple_profile"]["Row"];
type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];
type SpecialDay = Database["public"]["Tables"]["special_days"]["Row"];
type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];
const LOVE_MILESTONES = [100, 365, 500, 1000, 1500, 2000] as const;
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

function getAnnualOccurrence(dateString: string) {
  const today = startOfDay(new Date());
  const thisYear = new Date(`${today.getFullYear()}-${dateString.slice(5)}`);

  if (isAfter(today, thisYear)) {
    return new Date(`${today.getFullYear() + 1}-${dateString.slice(5)}`);
  }

  return thisYear;
}

function getMilestoneTargets(daysInLove: number) {
  const targets: number[] = [...LOVE_MILESTONES];
  let next = 2500;

  while (next <= daysInLove + 1500) {
    targets.push(next);
    next += 500;
  }

  return [...new Set(targets)].sort((a, b) => a - b);
}

export async function getCoupleProfile() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("couple_profile")
    .select("*")
    .limit(1)
    .maybeSingle();
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
    request = request.or(
      `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`,
    );
  }

  const { data } = await request;
  const safeData = (data as WishlistItem[] | null) ?? [];

  return safeData.map((item) => ({
    ...item,
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

  const upcoming = days
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
  return (data as GalleryItem[] | null) ?? [];
}

export function getLoveStats(loveStartDate: string | null) {
  if (!loveStartDate) {
    return null;
  }

  const today = startOfDay(new Date());
  const startedAt = startOfDay(new Date(loveStartDate));
  const daysInLove = differenceInCalendarDays(today, startedAt);

  const milestones = getMilestoneTargets(daysInLove).map((days) => {
    const date = addDays(startedAt, days);
    return {
      id: `milestone-${days}`,
      title: `${days} ngày yêu nhau`,
      description: `Cột mốc ${days} ngày kể từ lúc bắt đầu.`,
      date,
      countdown: differenceInCalendarDays(date, today),
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

  const loveStats = getLoveStats(profile?.love_start_date ?? null);
  const milestoneEvents = loveStats?.milestones ?? [];
  const birthdayEvents = getBirthdayEvents(profile);

  return [...manualEvents, ...birthdayEvents, ...milestoneEvents].sort(
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
