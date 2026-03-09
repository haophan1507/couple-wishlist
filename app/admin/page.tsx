import { upsertCoupleProfileAction } from "@/app/actions/couple-profile";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import {
  getCoupleProfile,
  getGalleryItems,
  getGiftHistoryItems,
  getSpecialDays,
  getWishlistItems
} from "@/lib/data/queries";
import type { ReactNode } from "react";

function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-mocha/80 dark:text-white/70">{label}</span>
      {children}
    </label>
  );
}

export default async function AdminPage() {
  const [profile, wishlist, days, gallery, giftHistory] = await Promise.all([
    getCoupleProfile(),
    getWishlistItems(),
    getSpecialDays(),
    getGalleryItems(),
    getGiftHistoryItems()
  ]);

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Bảng điều khiển</h1>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Món trong wishlist</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{wishlist.length}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Ngày đặc biệt</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{days.length}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Ảnh kỷ niệm</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{gallery.length}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Quà đã lưu lịch sử</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{giftHistory.length}</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold dark:text-white">Hồ sơ cặp đôi</h2>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
          Hiển thị ở trang chủ và dùng để tự động tính cột mốc yêu nhau.
        </p>

        <form action={upsertCoupleProfileAction} className="mt-6 space-y-6">
          <div className="rounded-3xl border border-mocha/10 bg-blush/50 p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="text-lg font-semibold dark:text-white">Thiết lập chung</h3>
            <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
              Thông tin dùng cho timeline tình yêu và phần giới thiệu trên website.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Tên người thứ nhất">
                <input name="person_one_name" defaultValue={profile?.person_one_name ?? ""} required />
              </Field>
              <Field label="Tên người thứ hai">
                <input name="person_two_name" defaultValue={profile?.person_two_name ?? ""} required />
              </Field>
              <Field label="Ngày bắt đầu yêu">
                <input
                  name="love_start_date"
                  type="date"
                  defaultValue={profile?.love_start_date ?? ""}
                  required
                />
              </Field>
              <Field label="Ảnh bìa">
                <>
                  <input
                    type="hidden"
                    name="existing_cover_image_path"
                    defaultValue={profile?.cover_image_path ?? ""}
                  />
                  <input type="file" name="cover_image_file" accept="image/*" />
                </>
              </Field>
              <Field label="Mô tả ảnh bìa">
                <input
                  name="cover_image_alt"
                  placeholder="Ví dụ: hai bạn trong chuyến đi biển"
                  defaultValue={profile?.cover_image_alt ?? ""}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Câu chuyện của hai bạn">
                  <textarea
                    name="story"
                    rows={5}
                    placeholder="Viết vài dòng về hành trình của hai bạn..."
                    defaultValue={profile?.story ?? ""}
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-mocha/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-semibold dark:text-white">{profile?.person_one_name || "Người thứ nhất"}</h3>
              <div className="mt-4 space-y-4">
                <Field label="Ngày sinh">
                  <input
                    name="person_one_birthday"
                    type="date"
                    defaultValue={profile?.person_one_birthday ?? ""}
                  />
                </Field>
                <Field label="Món yêu thích">
                  <input
                    name="person_one_favorite"
                    placeholder="Ví dụ: cà phê sữa đá, matcha, hoa tulip"
                    defaultValue={profile?.person_one_favorite ?? ""}
                  />
                </Field>
                <Field label="Sở thích">
                  <input
                    name="person_one_hobby"
                    placeholder="Ví dụ: chụp ảnh, chạy bộ, đọc sách"
                    defaultValue={profile?.person_one_hobby ?? ""}
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-3xl border border-mocha/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-semibold dark:text-white">{profile?.person_two_name || "Người thứ hai"}</h3>
              <div className="mt-4 space-y-4">
                <Field label="Ngày sinh">
                  <input
                    name="person_two_birthday"
                    type="date"
                    defaultValue={profile?.person_two_birthday ?? ""}
                  />
                </Field>
                <Field label="Món yêu thích">
                  <input
                    name="person_two_favorite"
                    placeholder="Ví dụ: bánh ngọt, spa, đồ trang sức nhỏ"
                    defaultValue={profile?.person_two_favorite ?? ""}
                  />
                </Field>
                <Field label="Sở thích">
                  <input
                    name="person_two_hobby"
                    placeholder="Ví dụ: picnic, chăm cây, xem phim"
                    defaultValue={profile?.person_two_hobby ?? ""}
                  />
                </Field>
              </div>
            </div>
          </div>

          <FormSubmitButton
            idleLabel="Lưu hồ sơ"
            loadingLabel="Đang lưu..."
            className="md:w-fit"
          />
        </form>
      </section>
    </>
  );
}
