import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { WishlistContentFallback, WishlistPageContent } from "./wishlist-content";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Theo dõi những món quà, điều muốn có và ý tưởng bất ngờ dành cho nhau.",
};

export default function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; mePage?: string; honeyPage?: string }>;
}) {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title font-(--font-heading)">Wishlist</h1>
        <p className="section-subtitle">
          Hai bạn cùng cập nhật món quà, điều muốn có và ý tưởng bất ngờ dành cho nhau.
        </p>

        <Suspense fallback={<WishlistContentFallback />}>
          <WishlistPageContent searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}
