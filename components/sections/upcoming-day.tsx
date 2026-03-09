import { format } from "date-fns";
import { CalendarClock } from "lucide-react";

type UpcomingDayProps = {
  title: string;
  date: Date;
  countdown: number;
};

export function UpcomingDay({ title, date, countdown }: UpcomingDayProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <CalendarClock className="h-5 w-5 text-rose" />
        <p className="text-sm font-medium dark:text-white/80">Ngày đặc biệt sắp tới</p>
      </div>
      <h3 className="mt-4 text-xl font-semibold dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">{format(date, "EEEE, MMMM d, yyyy")}</p>
      <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm font-medium dark:bg-white/10 dark:text-white/80">
        Còn {countdown} ngày nữa
      </p>
    </div>
  );
}
