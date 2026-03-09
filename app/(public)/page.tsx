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
  description: "Trang wishlist lãng mạn và góc kỷ niệm của tụi mình dành cho gia đình, bạn bè."
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
                <p className="text-sm text-mocha/70">Chưa có ngày đặc biệt. Hãy thêm trong trang quản trị.</p>
              </div>
            )}

            <WishlistPreview
              title={`Wishlist của ${profile?.person_one_name ?? "mình"}`}
              count={meItems.length}
              reservedCount={meItems.filter((item) => item.is_reserved).length}
            />
            <WishlistPreview
              title={`Wishlist của ${profile?.person_two_name ?? "người thương"}`}
              count={honeyItems.length}
              reservedCount={honeyItems.filter((item) => item.is_reserved).length}
            />
          </div>
        </Container>
      </section>

      <section className="mt-12 md:mt-16">
        <Container>
          <div className="card grid gap-8 p-8 md:grid-cols-2 md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-blush px-3 py-1 text-xs">
                <Heart className="h-3.5 w-3.5" />
                Về tụi mình
              </p>
              <h2 className="mt-4 section-title font-[var(--font-heading)]">Câu chuyện của tụi mình</h2>
              <p className="section-subtitle">
                {profile?.story ??
                  "Tụi mình tạo trang này để chia sẻ những món quà yêu thích và cùng nhau lưu lại những cột mốc đáng nhớ."}
              </p>
            </div>
            <div className="rounded-3xl bg-blush p-6">
              <p className="text-sm text-mocha/70">Gợi ý cho bạn bè và người thân</p>
              <h3 className="mt-2 text-xl font-semibold">Đặt trước trước khi mua</h3>
              <p className="mt-2 text-sm text-mocha/75">
                Hãy bấm đặt trước ở mỗi món quà để mọi người phối hợp và tránh mua trùng.
              </p>
              <Gift className="mt-4 h-5 w-5 text-mocha" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
