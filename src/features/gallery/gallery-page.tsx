import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { GalleryGrid } from "@/components/gallery-grid";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageHeader } from "@/components/ui/page-header";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { Container } from "@/components/ui/container";
import { fetchGalleryPage, queryKeys } from "@/lib/data/client-queries";

const PAGE_SIZE = 10;

type GalleryPageProps = {
  page: number;
};

export function GalleryPage({ page }: GalleryPageProps) {
  const listQuery = useQuery({
    queryKey: queryKeys.gallery({ page }),
    queryFn: () => fetchGalleryPage(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  const header = (
    <PageHeader
      title="Khoảnh khắc"
      description="Những bức ảnh và kỷ niệm nhỏ hai bạn muốn giữ lại."
    />
  );

  if (listQuery.isPending && !listQuery.data) {
    return (
      <section className="py-10 md:py-12">
        <Container>
          {header}
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
        {header}
        <div className="mt-8">
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
