import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { GalleryGrid } from "@/components/gallery-grid";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { Container } from "@/components/ui/container";
import { fetchGalleryPage, queryKeys } from "@/lib/data/client-queries";

const PAGE_SIZE = 12;

type GalleryPageProps = {
  page: number;
};

export function GalleryPage({ page }: GalleryPageProps) {
  const listQuery = useQuery({
    queryKey: queryKeys.gallery({ page }),
    queryFn: () => fetchGalleryPage(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  if (listQuery.isPending && !listQuery.data) {
    return (
      <section className="py-10 md:py-12">
        <Container>
          <h1 className="section-title">Khoảnh khắc</h1>
          <p className="section-subtitle">
            Những bức ảnh và kỷ niệm nhỏ hai bạn muốn giữ lại.
          </p>
          <SectionSkeleton cards={6} />
        </Container>
      </section>
    );
  }

  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title">Khoảnh khắc</h1>
        <p className="section-subtitle">
          Những bức ảnh và kỷ niệm nhỏ hai bạn muốn giữ lại.
        </p>
        <div className="mt-8 max-h-[75vh] overflow-y-auto pr-1">
          <GalleryGrid items={listQuery.data?.items ?? []} />
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
