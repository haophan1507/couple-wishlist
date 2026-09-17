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
          <p className="text-sm text-destructive">
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
        coverImagePath={profile?.cover_image_path ?? null}
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
                <p className="text-sm text-muted-foreground">
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
          <div className="card p-8 md:p-10">
            <h2 className="section-title">Câu chuyện của tụi mình</h2>
            <p className="section-subtitle max-w-2xl">
              {profile?.story ??
                "Tụi mình tạo trang này để gom lại wishlist, ngày đặc biệt, địa điểm yêu thương và những khoảnh khắc đáng nhớ."}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
