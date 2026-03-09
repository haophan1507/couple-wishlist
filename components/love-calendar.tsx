"use client";

import { useState } from "react";
import {
  addMonths,
  endOfMonth,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

type LoveCalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  source: "manual" | "milestone";
  badge?: string;
};

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function LoveCalendar({ events }: { events: LoveCalendarEvent[] }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const dayMap = new Map<string, LoveCalendarEvent[]>();

  for (const event of events) {
    const key = format(parseISO(event.date), "yyyy-MM-dd");
    const list = dayMap.get(key) ?? [];
    list.push(event);
    dayMap.set(key, list);
  }

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return {
      date: day,
      inCurrentMonth: isSameMonth(day, monthStart),
      events: dayMap.get(key) ?? [],
      isToday: isSameDay(day, new Date()),
    };
  });

  const visibleEvents = days.filter((day) => day.inCurrentMonth && day.events.length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth((value) => subMonths(value, 1))}
            className="rounded-full border border-mocha/15 p-2 hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-lg font-semibold dark:text-white">{format(monthStart, "MM/yyyy")}</h3>
          <button
            type="button"
            onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
            className="rounded-full border border-mocha/15 p-2 hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10"
            aria-label="Tháng sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-mocha/60 dark:text-white/45">
          {weekDays.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
          {days.map((day) => (
            <div
              key={day.date.toISOString()}
              className={[
                "min-h-24 rounded-2xl border p-2 text-left",
                day.inCurrentMonth
                  ? "border-mocha/10 bg-white/60 dark:border-white/10 dark:bg-white/5"
                  : "border-transparent bg-transparent opacity-40",
                day.isToday ? "ring-2 ring-rose/40" : "",
              ].join(" ")}
            >
              <p className="text-sm font-medium dark:text-white">{format(day.date, "d")}</p>
              <div className="mt-2 space-y-1">
                {day.events.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={[
                      "rounded-xl px-2 py-1 text-[11px] font-medium",
                      event.source === "milestone"
                        ? "bg-rose/15 text-mocha dark:bg-rose/20 dark:text-white"
                        : "bg-blush text-mocha dark:bg-white/10 dark:text-white/85",
                    ].join(" ")}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 2 ? (
                  <div className="text-[11px] text-mocha/55 dark:text-white/45">+{day.events.length - 2} sự kiện</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-semibold dark:text-white">Chi tiết trong tháng</h3>
        <div className="mt-4 space-y-3">
          {visibleEvents.length ? (
            visibleEvents.map((day) => (
              <div key={day.date.toISOString()} className="rounded-2xl bg-blush/70 p-4 dark:bg-white/5">
                <p className="text-sm font-semibold dark:text-white">{format(day.date, "dd/MM/yyyy")}</p>
                <div className="mt-2 space-y-2">
                  {day.events.map((event) => (
                    <div key={event.id}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium dark:text-white">{event.title}</p>
                        {event.badge ? (
                          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium dark:bg-white/10 dark:text-white/70">
                            {event.badge}
                          </span>
                        ) : null}
                      </div>
                      {event.description ? (
                        <p className="text-xs text-mocha/70 dark:text-white/55">{event.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-mocha/70 dark:text-white/55">Không có sự kiện nào trong tháng này.</p>
          )}
        </div>
      </div>
    </div>
  );
}
