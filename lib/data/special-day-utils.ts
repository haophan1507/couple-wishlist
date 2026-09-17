import {
  addDays,
  addYears,
  differenceInCalendarDays,
  differenceInYears,
  isAfter,
  startOfDay,
} from "date-fns";
import { AUTO_HOLIDAY_DEFINITIONS } from "@/lib/constants/special-days";
import type { Database } from "@/types/database";

type CoupleProfile = Database["public"]["Tables"]["couple_profile"]["Row"];
type SpecialDay = Database["public"]["Tables"]["special_days"]["Row"];

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

  for (const dayCount of [99, 500, 999]) {
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
    if (date > horizonDate) break;
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
    days.flatMap((day) => (day.type === "holiday" ? [day.date.slice(5)] : [])),
  );

  return AUTO_HOLIDAY_DEFINITIONS.flatMap((holiday) =>
    manualHolidayMonthDays.has(holiday.monthDay)
      ? []
      : [
          {
            id: `auto-holiday-${holiday.key}`,
            title: holiday.title,
            description: holiday.description,
            date: `2000-${holiday.monthDay}`,
            type: "holiday" as const,
            created_at: "2000-01-01T00:00:00.000Z",
          },
        ],
  );
}

export function getUpcomingDay(days: SpecialDay[]) {
  const today = startOfDay(new Date());
  const allDays = [...days, ...getAutoHolidayDays(days)];

  return allDays
    .map((day) => {
      const currentYear = new Date(`${new Date().getFullYear()}-${day.date.slice(5)}`);
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
}

export function getLoveStats(loveStartDate: string | null) {
  if (!loveStartDate) {
    return null;
  }

  const today = startOfDay(new Date());
  const startedAt = startOfDay(new Date(loveStartDate));
  const daysInLove = differenceInCalendarDays(today, startedAt);

  const milestones = getMilestoneTargets(startedAt, daysInLove).map((milestone) => ({
    id: `milestone-${milestone.dayCount}`,
    title: milestone.title,
    description: milestone.description,
    date: milestone.date,
    countdown: differenceInCalendarDays(milestone.date, today),
    source: "milestone" as const,
    type: "milestone",
    badge: "Cột mốc",
  }));

  return {
    daysInLove,
    startedAt,
    milestones,
    nextMilestone: milestones.find((milestone) => milestone.countdown >= 0) ?? null,
  };
}

function getBirthdayEvents(profile: CoupleProfile | null): TimelineEvent[] {
  if (!profile) return [];

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

  return entries.flatMap((entry) => {
    if (!entry.birthday) return [];

    const nextBirthday = getAnnualOccurrence(entry.birthday);
    const age = differenceInYears(nextBirthday, new Date(entry.birthday));
    const pieces = [`Sinh nhật ${age} tuổi`];
    if (entry.favorite) pieces.push(`Yêu thích: ${entry.favorite}`);
    if (entry.hobby) pieces.push(`Sở thích: ${entry.hobby}`);

    return [
      {
        id: `birthday-${entry.key}`,
        title: `Sinh nhật ${entry.name}`,
        description: pieces.join(" • "),
        date: nextBirthday,
        countdown: differenceInCalendarDays(nextBirthday, startOfDay(new Date())),
        source: "manual" as const,
        type: "birthday",
        badge: "Sinh nhật",
      },
    ];
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
      source: "manual" as const,
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
      source: "manual" as const,
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

export function getCoupleFacts(profile: CoupleProfile | null) {
  if (!profile) return [];

  return [
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
  ].map((person) => ({
    ...person,
    age: person.birthday
      ? differenceInYears(startOfDay(new Date()), startOfDay(new Date(person.birthday)))
      : null,
  }));
}

export type LoveTimelineEvent = ReturnType<typeof getTimelineEvents>[number];
