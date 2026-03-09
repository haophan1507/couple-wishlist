import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

type SpecialDayCardProps = {
  title: string;
  description: string | null;
  date: string;
  countdown: number;
};

export function SpecialDayCard({ title, description, date, countdown }: SpecialDayCardProps) {
  return (
    <article className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
          {description ? <p className="mt-2 text-sm text-mocha/75 dark:text-white/60">{description}</p> : null}
        </div>
        <CalendarDays className="h-5 w-5 text-rose" />
      </div>
      <p className="mt-4 text-sm text-mocha/80 dark:text-white/65">{format(new Date(date), "MMMM d")}</p>
      <p className="mt-2 rounded-xl bg-blush px-3 py-2 text-sm font-medium dark:bg-white/10 dark:text-white/80">Còn {countdown} ngày</p>
    </article>
  );
}
