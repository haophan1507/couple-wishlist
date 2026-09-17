import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { LoveCalendar } from "@/components/love-calendar";
import { SpecialDayCard } from "@/components/special-day-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { Container } from "@/components/ui/container";
import {
  fetchCoupleProfile,
  fetchSpecialDays,
  queryKeys,
} from "@/lib/data/client-queries";
import {
  getCoupleFacts,
  getLoveStats,
  getTimelineEvents,
} from "@/lib/data/special-day-utils";

export function SpecialDaysPage() {
  const profileQuery = useQuery({
    queryKey: queryKeys.coupleProfile,
    queryFn: fetchCoupleProfile,
  });
  const daysQuery = useQuery({
    queryKey: queryKeys.specialDays,
    queryFn: fetchSpecialDays,
  });

  const header = (
    <PageHeader
      title="Ngày đặc biệt"
      description="Theo dõi hành trình yêu và những cột mốc quan trọng."
    />
  );

  if (profileQuery.isPending || daysQuery.isPending) {
    return (
      <section className="py-10 md:py-12">
        <Container>
          {header}
          <SectionSkeleton cards={6} />
        </Container>
      </section>
    );
  }

  const profile = profileQuery.data ?? null;
  const specialDays = daysQuery.data ?? [];
  const loveStats = getLoveStats(profile?.love_start_date ?? null);
  const timelineEvents = getTimelineEvents(specialDays, profile);
  const upcomingEvents = timelineEvents.filter((event) => event.countdown >= 0);
  const nextMilestone = loveStats?.nextMilestone ?? null;
  const coupleFacts = getCoupleFacts(profile);

  return (
    <section className="py-10 md:py-12">
      <Container>
        {header}

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-6">
            <p className="text-sm text-muted-foreground">
              Ngày bắt đầu hành trình của chúng mình
            </p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {profile?.love_start_date
                ? format(new Date(profile.love_start_date), "dd/MM/yyyy")
                : "Chưa cập nhật"}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Số ngày đã yêu</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {loveStats?.daysInLove ?? "--"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cột mốc tự động</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {loveStats?.milestones.length ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày tự thêm</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {specialDays.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm text-muted-foreground">Cột mốc tiếp theo</p>
            {nextMilestone ? (
              <>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  {nextMilestone.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {format(nextMilestone.date, "dd/MM/yyyy")}
                </p>
                <p className="mt-4 text-sm font-medium text-foreground">
                  Còn {nextMilestone.countdown} ngày nữa
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Tất cả cột mốc hiện tại đã đi qua.
              </p>
            )}
          </div>
        </div>

        {upcomingEvents.length ? (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-foreground">Sự kiện sắp tới</h2>
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
            <h2 className="text-2xl font-semibold text-foreground">
              Điều thú vị về hai bạn
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {coupleFacts.map((person) => (
                <div key={person.name} className="card space-y-2 p-6">
                  <h3 className="text-xl font-semibold text-foreground">
                    {person.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tuổi: {person.age ?? "--"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yêu thích: {person.favorite || "Chưa cập nhật"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sở thích: {person.hobby || "Chưa cập nhật"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-foreground">Lịch tình yêu</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Xem các ngày trong tháng này và chi tiết cột mốc yêu cùng các ngày đặc biệt.
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
