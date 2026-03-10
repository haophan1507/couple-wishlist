import { deleteSpecialDayAction } from "@/app/actions/special-days";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { SpecialDayForm } from "@/components/admin/special-day-form";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getSpecialDays } from "@/lib/data/queries";

export default async function AdminSpecialDaysPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const days = await getSpecialDays();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(days.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedDays = days.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Quản lý Ngày Đặc Biệt</h1>
        <div className="mt-4">
          <SpecialDayForm />
        </div>
      </section>

      <section>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
        {paginatedDays.map((day) => (
          <div key={day.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium dark:text-white">{day.title}</p>
              <form id={`delete-special-day-${day.id}`} action={deleteSpecialDayAction}>
                <input type="hidden" name="id" value={day.id} />
                <ConfirmDeleteButton formId={`delete-special-day-${day.id}`} itemName={day.title} />
              </form>
            </div>
            <SpecialDayForm
              item={{
                id: day.id,
                title: day.title,
                description: day.description ?? "",
                date: day.date,
                type: day.type,
              }}
            />
          </div>
        ))}
        {!days.length ? <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có ngày đặc biệt nào.</p> : null}
        </div>
        <PaginationControls
          basePath="/admin/special-days"
          currentPage={safePage}
          totalPages={totalPages}
          searchParams={{}}
        />
      </section>
    </>
  );
}
