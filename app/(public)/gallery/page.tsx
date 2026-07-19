import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { GalleryContentFallback, GalleryPageContent } from "./gallery-content";

export const metadata: Metadata = {
  title: "Khoảnh khắc",
  description: "Bộ sưu tập những kỷ niệm đẹp của tụi mình.",
};

export default function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title font-(--font-heading)">Khoảnh khắc</h1>
        <p className="section-subtitle">Những kỷ niệm tụi mình trân quý.</p>

        <Suspense fallback={<GalleryContentFallback />}>
          <GalleryPageContent searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}
