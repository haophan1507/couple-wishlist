import { deleteSpecialDayAction, upsertSpecialDayAction } from "@/app/actions/special-days";
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
    <form action={upsertSpecialDayAction} className="grid gap-2 rounded-2xl border border-mocha/10 bg-white/60 p-4">
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
      <button type="submit" className="w-fit rounded-xl bg-mocha px-4 py-2 text-sm text-white">
        {day ? "Cập nhật" : "Thêm ngày"}
      </button>
    </form>
  );
}

export default async function AdminSpecialDaysPage() {
  const days = await getSpecialDays();

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Quản lý Ngày Đặc Biệt</h1>
        <div className="mt-4">
          <SpecialDayForm />
        </div>
      </section>

      <section className="space-y-3">
        {days.map((day) => (
          <div key={day.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">{day.title}</p>
              <form action={deleteSpecialDayAction}>
                <input type="hidden" name="id" value={day.id} />
                <button type="submit" className="text-xs text-red-600">
                  Xóa
                </button>
              </form>
            </div>
            <SpecialDayForm day={day} />
          </div>
        ))}
        {!days.length ? <p className="card p-6 text-sm text-mocha/70">Chưa có ngày đặc biệt nào.</p> : null}
      </section>
    </>
  );
}
