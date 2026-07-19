import { GalleryGrid } from "@/components/gallery-grid";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { getGalleryItems } from "@/lib/data/queries";

export async function GalleryPageContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [params, items] = await Promise.all([searchParams, getGalleryItems()]);
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <div className="mt-8 max-h-[75vh] overflow-y-auto pr-1">
        <GalleryGrid items={paginatedItems} />
      </div>
      <PaginationControls
        basePath="/gallery"
        currentPage={safePage}
        totalPages={totalPages}
        searchParams={{}}
      />
    </>
  );
}

export function GalleryContentFallback() {
  return <SectionSkeleton cards={6} />;
}
