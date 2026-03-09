import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery-grid";
import { Container } from "@/components/ui/container";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getGalleryItems } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Khoảnh khắc",
  description: "Bộ sưu tập những kỷ niệm đẹp của tụi mình."
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const items = await getGalleryItems();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title font-[var(--font-heading)]">Khoảnh khắc</h1>
        <p className="section-subtitle">Những kỷ niệm tụi mình trân quý.</p>
        <div className="mt-8 max-h-[75vh] overflow-y-auto pr-1">
          <GalleryGrid items={paginatedItems} />
        </div>
        <PaginationControls
          basePath="/gallery"
          currentPage={safePage}
          totalPages={totalPages}
          searchParams={{}}
        />
      </Container>
    </section>
  );
}
