import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery-grid";
import { Container } from "@/components/ui/container";
import { getGalleryItems } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Khoảnh khắc",
  description: "Bộ sưu tập những kỷ niệm đẹp của tụi mình."
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title font-[var(--font-heading)]">Khoảnh khắc</h1>
        <p className="section-subtitle">Những kỷ niệm tụi mình trân quý.</p>
        <div className="mt-8">
          <GalleryGrid items={items} />
        </div>
      </Container>
    </section>
  );
}
