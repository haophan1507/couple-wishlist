import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { SpecialDayForm } from "@/components/admin/special-day-form";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import {
  fetchAdminSpecialDaysPage,
  queryKeys,
} from "@/lib/data/client-queries";
import { deleteSpecialDayFn } from "@/src/server/special-days";

const PAGE_SIZE = 5;

export function AdminSpecialDaysPage({ page }: { page: number }) {
  const queryClient = useQueryClient();
  const listQuery = useQuery({
    queryKey: queryKeys.adminSpecialDaysPage({ page, pageSize: PAGE_SIZE }),
    queryFn: () => fetchAdminSpecialDaysPage(page, PAGE_SIZE),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "special-days"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.specialDays });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.set("id", id);
      await deleteSpecialDayFn({ data: formData });
    },
    onSuccess: invalidate,
  });

  if (listQuery.isPending && !listQuery.data) {
    return <SectionSkeleton cards={3} withTitle />;
  }

  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = listQuery.data?.items ?? [];

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">
          Quản lý Ngày Đặc Biệt
        </h1>
        <div className="mt-4">
          <SpecialDayForm onSuccess={invalidate} />
        </div>
      </section>

      <section>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
          {items.map((day) => (
            <div key={day.id} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium dark:text-white">{day.title}</p>
                <ConfirmDeleteButton
                  itemName={day.title}
                  onConfirm={() => deleteMutation.mutate(day.id)}
                />
              </div>
              <SpecialDayForm
                onSuccess={invalidate}
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
          {!items.length ? (
            <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
              Chưa có ngày đặc biệt nào.
            </p>
          ) : null}
        </div>
        <PaginationControls
          basePath="/admin/special-days"
          currentPage={safePage}
          totalPages={totalPages}
        />
      </section>
    </>
  );
}
