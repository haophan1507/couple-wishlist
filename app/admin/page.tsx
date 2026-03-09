import { upsertCoupleProfileAction } from "@/app/actions/couple-profile";
import { getCoupleProfile, getGalleryItems, getSpecialDays, getWishlistItems } from "@/lib/data/queries";

export default async function AdminPage() {
  const [profile, wishlist, days, gallery] = await Promise.all([
    getCoupleProfile(),
    getWishlistItems(),
    getSpecialDays(),
    getGalleryItems()
  ]);

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Bảng điều khiển</h1>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-blush p-4">
            <p className="text-sm text-mocha/70">Món trong wishlist</p>
            <p className="mt-1 text-2xl font-semibold">{wishlist.length}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4">
            <p className="text-sm text-mocha/70">Ngày đặc biệt</p>
            <p className="mt-1 text-2xl font-semibold">{days.length}</p>
          </div>
          <div className="rounded-2xl bg-blush p-4">
            <p className="text-sm text-mocha/70">Ảnh kỷ niệm</p>
            <p className="mt-1 text-2xl font-semibold">{gallery.length}</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Hồ sơ cặp đôi</h2>
        <p className="mt-1 text-sm text-mocha/70">Hiển thị ở trang chủ công khai.</p>

        <form action={upsertCoupleProfileAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="person_one_name" placeholder="Tên người thứ nhất" defaultValue={profile?.person_one_name ?? ""} required />
          <input name="person_two_name" placeholder="Tên người thứ hai" defaultValue={profile?.person_two_name ?? ""} required />
          <textarea
            className="md:col-span-2"
            name="story"
            rows={5}
            placeholder="Câu chuyện ngắn"
            defaultValue={profile?.story ?? ""}
          />
          <input
            className="md:col-span-2"
            name="cover_image_url"
            placeholder="URL ảnh bìa"
            defaultValue={profile?.cover_image_url ?? ""}
          />
          <button type="submit" className="rounded-xl bg-mocha px-4 py-2 text-sm text-white md:col-span-2 md:w-fit">
            Lưu hồ sơ
          </button>
        </form>
      </section>
    </>
  );
}
