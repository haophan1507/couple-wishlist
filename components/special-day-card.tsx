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
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <CalendarDays className="h-5 w-5 shrink-0 text-rose" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{format(new Date(date), "MMMM d")}</p>
      <p className="mt-2 text-sm font-medium text-foreground">Còn {countdown} ngày</p>
    </article>
  );
}
