import type { Metadata } from "next";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { Container } from "@/components/ui/container";
import { SpecialDayCard } from "@/components/special-day-card";
import { getDaysTogether, getSpecialDays } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Ngày đặc biệt",
  description: "Những cột mốc đáng nhớ và đếm ngược cho các ngày sắp tới."
};

export default async function SpecialDaysPage() {
  const days = await getSpecialDays();
  const together = getDaysTogether(days);

  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title font-[var(--font-heading)]">Ngày đặc biệt</h1>
        <p className="section-subtitle">Những khoảnh khắc tụi mình luôn mong chờ.</p>

        {together !== null ? (
          <div className="mt-6 card p-5">
            <p className="text-sm text-mocha/75">Số ngày bên nhau</p>
            <p className="mt-1 text-3xl font-semibold">{together}</p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => {
            const thisYearDate = new Date(`${new Date().getFullYear()}-${day.date.slice(5)}`);
            const finalDate =
              thisYearDate < startOfDay(new Date())
                ? new Date(`${new Date().getFullYear() + 1}-${day.date.slice(5)}`)
                : thisYearDate;

            return (
              <SpecialDayCard
                key={day.id}
                title={day.title}
                description={day.description}
                date={finalDate.toISOString()}
                countdown={differenceInCalendarDays(finalDate, startOfDay(new Date()))}
              />
            );
          })}
          {!days.length ? <p className="card p-8 text-sm text-mocha/70">Chưa có ngày đặc biệt nào.</p> : null}
        </div>
      </Container>
    </section>
  );
}
