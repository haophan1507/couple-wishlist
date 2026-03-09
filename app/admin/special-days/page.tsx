import { deleteSpecialDayAction, upsertSpecialDayAction } from "@/app/actions/special-days";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { getSpecialDays } from "@/lib/data/queries";

function SpecialDayForm({
  day
}: {
  day?: {
    id: string;
    title: string;
    description: string | null;
    date: string;
    type: string;
  };
}) {
  return (
    <form action={upsertSpecialDayAction} className="grid gap-2 rounded-2xl border border-mocha/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <input type="hidden" name="id" defaultValue={day?.id ?? ""} />
      <input name="title" placeholder="Tiêu đề" defaultValue={day?.title ?? ""} required />
      <textarea name="description" rows={2} placeholder="Mô tả" defaultValue={day?.description ?? ""} />
      <div className="grid gap-2 md:grid-cols-2">
        <input name="date" type="date" defaultValue={day?.date ?? ""} required />
        <select name="type" defaultValue={day?.type ?? "other"}>
          <option value="birthday">Sinh nhật</option>
          <option value="anniversary">Kỷ niệm</option>
          <option value="relationship">Mốc yêu nhau</option>
          <option value="holiday">Ngày lễ</option>
          <option value="other">Khác</option>
        </select>
      </div>
      <FormSubmitButton
        idleLabel={day ? "Cập nhật" : "Thêm ngày"}
        loadingLabel={day ? "Đang cập nhật..." : "Đang thêm..."}
      />
    </form>
  );
}

export default async function AdminSpecialDaysPage() {
  const days = await getSpecialDays();

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Quản lý Ngày Đặc Biệt</h1>
        <div className="mt-4">
          <SpecialDayForm />
        </div>
      </section>

      <section className="space-y-3">
        {days.map((day) => (
          <div key={day.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium dark:text-white">{day.title}</p>
              <form id={`delete-special-day-${day.id}`} action={deleteSpecialDayAction}>
                <input type="hidden" name="id" value={day.id} />
                <ConfirmDeleteButton formId={`delete-special-day-${day.id}`} itemName={day.title} />
              </form>
            </div>
            <SpecialDayForm day={day} />
          </div>
        ))}
        {!days.length ? <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có ngày đặc biệt nào.</p> : null}
      </section>
    </>
  );
}
