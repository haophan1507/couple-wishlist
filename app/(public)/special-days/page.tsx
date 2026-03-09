import type { Metadata } from "next";
import { format } from "date-fns";
import { LoveCalendar } from "@/components/love-calendar";
import { SpecialDayCard } from "@/components/special-day-card";
import { Container } from "@/components/ui/container";
import {
  getCoupleFacts,
  getCoupleProfile,
  getLoveStats,
  getSpecialDays,
  getTimelineEvents,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Ngày đặc biệt",
  description:
    "Đếm ngày yêu nhau, cột mốc tình yêu và lịch kỷ niệm của hai bạn.",
};

export default async function SpecialDaysPage() {
  const [profile, specialDays] = await Promise.all([
    getCoupleProfile(),
    getSpecialDays(),
  ]);
  const loveStats = getLoveStats(profile?.love_start_date ?? null);
  const timelineEvents = getTimelineEvents(specialDays, profile);
  const upcomingEvents = timelineEvents.filter((event) => event.countdown >= 0);
  const nextMilestone = loveStats?.nextMilestone ?? null;
  const coupleFacts = getCoupleFacts(profile);

  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title font-[var(--font-heading)]">
          Ngày đặc biệt
        </h1>
        <p className="section-subtitle">
          Tự động đếm hành trình yêu và kết hợp với những ngày hai bạn tự thêm
          vào.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-6">
            <p className="text-sm text-mocha/70 dark:text-white/55">
              Ngày bắt đầu hành trình của chúng mình
            </p>
            <p className="mt-2 text-3xl font-semibold dark:text-white">
              {profile?.love_start_date
                ? format(new Date(profile.love_start_date), "dd/MM/yyyy")
                : "Chưa cập nhật"}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
                <p className="text-xs text-mocha/60 dark:text-white/45">
                  Số ngày đã yêu
                </p>
                <p className="mt-1 text-2xl font-semibold dark:text-white">
                  {loveStats?.daysInLove ?? "--"}
                </p>
              </div>
              <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
                <p className="text-xs text-mocha/60 dark:text-white/45">
                  Cột mốc tự động
                </p>
                <p className="mt-1 text-2xl font-semibold dark:text-white">
                  {loveStats?.milestones.length ?? 0}
                </p>
              </div>
              <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
                <p className="text-xs text-mocha/60 dark:text-white/45">
                  Ngày tự thêm
                </p>
                <p className="mt-1 text-2xl font-semibold dark:text-white">
                  {specialDays.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm text-mocha/70 dark:text-white/55">
              Cột mốc tiếp theo
            </p>
            {nextMilestone ? (
              <>
                <h2 className="mt-2 text-2xl font-semibold dark:text-white">
                  {nextMilestone.title}
                </h2>
                <p className="mt-2 text-sm text-mocha/75 dark:text-white/55">
                  {format(nextMilestone.date, "dd/MM/yyyy")}
                </p>
                <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm font-medium dark:bg-white/10 dark:text-white/80">
                  Còn {nextMilestone.countdown} ngày nữa
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-mocha/75 dark:text-white/55">
                Tất cả cột mốc hiện tại đã đi qua.
              </p>
            )}
          </div>
        </div>

        {upcomingEvents.length ? (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold dark:text-white">
              Sự kiện sắp tới
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.slice(0, 6).map((event) => (
                <SpecialDayCard
                  key={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.date.toISOString()}
                  countdown={event.countdown}
                />
              ))}
            </div>
          </div>
        ) : null}

        {coupleFacts.length ? (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold dark:text-white">Điều thú vị về hai bạn</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {coupleFacts.map((person) => (
                <div key={person.name} className="card p-6">
                  <h3 className="text-xl font-semibold dark:text-white">{person.name}</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
                      <p className="text-xs text-mocha/60 dark:text-white/45">Tuổi</p>
                      <p className="mt-1 text-lg font-semibold dark:text-white">{person.age ?? "--"}</p>
                    </div>
                    <div className="rounded-2xl bg-blush p-4 dark:bg-white/5 sm:col-span-2">
                      <p className="text-xs text-mocha/60 dark:text-white/45">Yêu thích</p>
                      <p className="mt-1 text-sm font-medium dark:text-white">{person.favorite || "Chưa cập nhật"}</p>
                    </div>
                    <div className="rounded-2xl bg-blush p-4 dark:bg-white/5 sm:col-span-3">
                      <p className="text-xs text-mocha/60 dark:text-white/45">Sở thích</p>
                      <p className="mt-1 text-sm font-medium dark:text-white">{person.hobby || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <h2 className="text-2xl font-semibold dark:text-white">
            Lịch tình yêu
          </h2>
          <p className="mt-2 text-sm text-mocha/70 dark:text-white/55">
            Xem các ngày trong tháng này và chi tiết cột mốc yêu cùng các ngày
            đặc biệt.
          </p>
          <div className="mt-4">
            <LoveCalendar
              events={timelineEvents.map((event) => ({
                id: event.id,
                title: event.title,
                description: event.description,
                date: event.date.toISOString(),
                source: event.source,
                badge: event.badge,
              }))}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
