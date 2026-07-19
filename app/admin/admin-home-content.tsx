import { upsertCoupleProfileAction } from "@/app/actions/couple-profile";
import { sendManualEmailAction } from "@/app/actions/notifications";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import {
  getCoupleProfile,
  getGalleryCount,
  getGiftHistoryCount,
  getPlacesCount,
  getSpecialDaysCount,
  getWishlistCount
} from "@/lib/data/queries";
import { APP_NAME } from "@/lib/constants/app";
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

export async function AdminHomePageContent({
  searchParams
}: {
  searchParams: Promise<{
    manualEmail?: string;
    sent?: string;
    events?: string;
    reason?: string;
    message?: string;
  }>;
}) {
  const [params, profile, wishlistCount, specialDaysCount, galleryCount, giftHistoryCount, placesCount] =
    await Promise.all([
      searchParams,
      getCoupleProfile(),
      getWishlistCount(),
      getSpecialDaysCount(),
      getGalleryCount(),
      getGiftHistoryCount(),
      getPlacesCount(),
    ]);

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
          Tổng quan không gian riêng của hai bạn: wishlist, kỷ niệm quà, ngày đặc biệt, ảnh và địa điểm yêu thương.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Wishlist</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{wishlistCount}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Ngày đặc biệt</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{specialDaysCount}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Ảnh kỷ niệm</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{galleryCount}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Kỷ niệm quà</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{giftHistoryCount}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4 dark:bg-white/5">
            <p className="text-sm text-mocha/70 dark:text-white/55">Bản đồ yêu thương</p>
            <p className="mt-1 text-2xl font-semibold dark:text-white">{placesCount}</p>
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

        <div className="mt-6 border-t border-mocha/10 pt-4 dark:border-white/10">
          <details className="group">
            <summary className="cursor-pointer text-xs text-mocha/55 hover:text-mocha/75 dark:text-white/45 dark:hover:text-white/65">
              Công cụ hệ thống
            </summary>
            <div className="mt-3 space-y-3">
              <form
                action={sendManualEmailAction}
                className="grid gap-3 rounded-2xl border border-mocha/10 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Người nhận">
                    <input
                      name="manual_email_recipients"
                      type="text"
                      placeholder="email@example.com, email-2@example.com"
                    />
                  </Field>
                  <Field label="Tiêu đề">
                    <input
                      name="subject"
                      type="text"
                      placeholder={APP_NAME}
                    />
                  </Field>
                </div>
                <Field label="Nội dung">
                  <textarea
                    name="manual_email_message"
                    rows={4}
                    placeholder="Nhập nội dung muốn gửi..."
                  />
                </Field>
                <p className="text-xs text-mocha/55 dark:text-white/45">
                  Bỏ trống người nhận để dùng danh sách trong NOTIFICATION_TO_EMAILS.
                </p>
                <FormSubmitButton
                  idleLabel="Gửi email"
                  loadingLabel="Đang gửi..."
                  className="rounded-lg bg-transparent px-3 py-1.5 text-xs text-mocha/70 ring-1 ring-mocha/20 hover:bg-white dark:bg-transparent dark:text-white/70 dark:ring-white/20 dark:hover:bg-white/10"
                />
              </form>
              {params.manualEmail === "done" ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Đã gửi {params.sent ?? "0"} email. Sự kiện hôm nay: {params.events ?? "0"}.
                  {params.reason ? ` ${params.reason}` : ""}
                </p>
              ) : null}
              {params.manualEmail === "error" ? (
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Lỗi gửi email: {params.message ?? "Lỗi không xác định"}.
                </p>
              ) : null}
            </div>
          </details>
        </div>
      </section>
    </>
  );
}
