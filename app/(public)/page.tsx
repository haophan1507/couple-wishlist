import type { Metadata } from "next";
import { Gift, Heart } from "lucide-react";
import { Container } from "@/components/ui/container";
import { HeroSection } from "@/components/sections/hero-section";
import { UpcomingDay } from "@/components/sections/upcoming-day";
import { WishlistPreview } from "@/components/sections/wishlist-preview";
import {
  getCoupleProfile,
  getSpecialDays,
  getUpcomingDay,
  getWishlistItems
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Trang wishlist riêng tư và góc kỷ niệm của tụi mình."
};

export default async function HomePage() {
  const [profile, days, allItems] = await Promise.all([
    getCoupleProfile(),
    getSpecialDays(),
    getWishlistItems()
  ]);

  const upcoming = getUpcomingDay(days);
  const meItems = allItems.filter((item) => item.owner_type === "me");
  const honeyItems = allItems.filter((item) => item.owner_type === "honey");

  return (
    <>
      <HeroSection
        names={`${profile?.person_one_name ?? "Bạn"} & ${profile?.person_two_name ?? "Người thương"}`}
        coverImageUrl={profile?.cover_image_url ?? null}
        story={profile?.story ?? null}
      />

      <section className="mt-12 md:mt-16">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming ? (
              <UpcomingDay title={upcoming.title} date={upcoming.upcomingDate} countdown={upcoming.countdown} />
            ) : (
              <div className="card p-6">
                <p className="text-sm text-mocha/70 dark:text-white/50">Chưa có ngày đặc biệt. Hãy thêm trong trang quản trị.</p>
              </div>
            )}

            <WishlistPreview
              title={`Wishlist của ${profile?.person_one_name ?? "mình"}`}
              count={meItems.length}
              giftedCount={meItems.filter((item) => item.is_gifted).length}
            />
            <WishlistPreview
              title={`Wishlist của ${profile?.person_two_name ?? "người thương"}`}
              count={honeyItems.length}
              giftedCount={honeyItems.filter((item) => item.is_gifted).length}
            />
          </div>
        </Container>
      </section>

      <section className="mt-12 md:mt-16">
        <Container>
          <div className="card grid gap-8 p-8 md:grid-cols-2 md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-blush px-3 py-1 text-xs dark:bg-white/10 dark:text-white/70">
                <Heart className="h-3.5 w-3.5" />
                Về tụi mình
              </p>
              <h2 className="mt-4 section-title font-[var(--font-heading)]">Câu chuyện của tụi mình</h2>
              <p className="section-subtitle">
                {profile?.story ??
                  "Tụi mình tạo trang này để chia sẻ những món quà yêu thích và cùng nhau lưu lại những cột mốc đáng nhớ."}
              </p>
            </div>
            <div className="rounded-3xl bg-blush p-6 dark:bg-white/5">
              <p className="text-sm text-mocha/70 dark:text-white/55">Không gian riêng cho cặp đôi</p>
              <h3 className="mt-2 text-xl font-semibold dark:text-white">Cùng nhau chuẩn bị bất ngờ</h3>
              <p className="mt-2 text-sm text-mocha/75 dark:text-white/60">
                Hai bạn có thể thêm món quà, theo dõi trạng thái và đánh dấu khi đã tặng cho nhau.
              </p>
              <Gift className="mt-4 h-5 w-5 text-mocha dark:text-white/70" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
