import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { WishlistCard } from "@/components/wishlist-card";
import { WishlistFilter } from "@/components/wishlist-filter";
import { getCoupleProfile, getWishlistCategories, getWishlistItems } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Danh sách quà",
  description: "Theo dõi và quản lý danh sách quà riêng tư của tụi mình."
};

export default async function WishlistPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;

  const [profile, categories, items] = await Promise.all([
    getCoupleProfile(),
    getWishlistCategories(),
    getWishlistItems({
      category: params.category,
      query: params.q
    })
  ]);

  const meItems = items.filter((item) => item.owner_type === "me");
  const honeyItems = items.filter((item) => item.owner_type === "honey");

  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title font-[var(--font-heading)]">Danh sách quà</h1>
        <p className="section-subtitle">Hai bạn cùng cập nhật và theo dõi trạng thái quà dành cho nhau.</p>

        <Suspense>
          <WishlistFilter categories={categories} />
        </Suspense>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold dark:text-white">Wishlist của {profile?.person_one_name ?? "mình"}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {meItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
              {!meItems.length ? <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có món quà nào.</p> : null}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold dark:text-white">Wishlist của {profile?.person_two_name ?? "người thương"}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {honeyItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
              {!honeyItems.length ? <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có món quà nào.</p> : null}
            </div>
          </section>
        </div>
      </Container>
    </section>
  );
}
