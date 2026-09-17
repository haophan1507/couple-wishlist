import { Heart, MapPinned } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui/container";
import { HeroSection } from "@/components/sections/hero-section";
import { UpcomingDay } from "@/components/sections/upcoming-day";
import { WishlistPreview } from "@/components/sections/wishlist-preview";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import {
  fetchCoupleProfile,
  fetchSpecialDays,
  fetchWishlistOwnerCounts,
  queryKeys,
} from "@/lib/data/client-queries";
import { getUpcomingDay } from "@/lib/data/special-day-utils";

export function HomePage() {
  const profileQuery = useQuery({
    queryKey: queryKeys.coupleProfile,
    queryFn: fetchCoupleProfile,
  });
  const daysQuery = useQuery({
    queryKey: queryKeys.specialDays,
    queryFn: fetchSpecialDays,
  });
  const countsQuery = useQuery({
    queryKey: queryKeys.wishlistCounts,
    queryFn: fetchWishlistOwnerCounts,
  });

  const isLoading =
    profileQuery.isPending || daysQuery.isPending || countsQuery.isPending;

  if (isLoading) {
    return <SectionSkeleton cards={3} withTitle />;
  }

  if (profileQuery.isError || daysQuery.isError || countsQuery.isError) {
    return (
      <Container className="py-16">
        <div className="card p-6">
          <p className="text-sm text-red-600 dark:text-red-400">
            Không tải được dữ liệu trang chủ. Thử tải lại trang.
          </p>
        </div>
      </Container>
    );
  }

  const profile = profileQuery.data;
  const upcoming = getUpcomingDay(daysQuery.data ?? []);
  const me = countsQuery.data?.me ?? { count: 0, giftedCount: 0 };
  const honey = countsQuery.data?.honey ?? { count: 0, giftedCount: 0 };

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
              <UpcomingDay
                title={upcoming.title}
                date={upcoming.upcomingDate}
                countdown={upcoming.countdown}
              />
            ) : (
              <div className="card p-6">
                <p className="text-sm text-mocha/70 dark:text-white/50">
                  Chưa có ngày đặc biệt. Hãy thêm trong trang quản trị.
                </p>
              </div>
            )}

            <WishlistPreview
              title={`Wishlist của ${profile?.person_one_name ?? "mình"}`}
              count={me.count}
              giftedCount={me.giftedCount}
            />
            <WishlistPreview
              title={`Wishlist của ${profile?.person_two_name ?? "người thương"}`}
              count={honey.count}
              giftedCount={honey.giftedCount}
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
              <h2 className="mt-4 section-title">Câu chuyện của tụi mình</h2>
              <p className="section-subtitle">
                {profile?.story ??
                  "Tụi mình tạo trang này để gom lại wishlist, ngày đặc biệt, địa điểm yêu thương và những khoảnh khắc đáng nhớ."}
              </p>
            </div>
            <div className="rounded-3xl bg-blush p-6 dark:bg-white/5">
              <p className="text-sm text-mocha/70 dark:text-white/55">
                Không gian riêng cho cặp đôi
              </p>
              <h3 className="mt-2 text-xl font-semibold dark:text-white">
                Cùng nhau lưu lại hành trình
              </h3>
              <p className="mt-2 text-sm text-mocha/75 dark:text-white/60">
                Hai bạn có thể ghi lại điều muốn làm, món quà yêu thích, nơi từng đi
                qua và các cột mốc cần nhớ.
              </p>
              <MapPinned className="mt-4 h-5 w-5 text-mocha dark:text-white/70" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
