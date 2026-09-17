import { useQuery } from "@tanstack/react-query";
import { HeartMappingExperience } from "@/components/heart-mapping-experience";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { Container } from "@/components/ui/container";
import { fetchPlaceMemories, queryKeys } from "@/lib/data/client-queries";

export function HeartMappingPage() {
  const placesQuery = useQuery({
    queryKey: queryKeys.places,
    queryFn: fetchPlaceMemories,
  });

  if (placesQuery.isPending) {
    return (
      <section className="py-10 md:py-12">
        <Container>
          <SectionSkeleton cards={3} withTitle />
        </Container>
      </section>
    );
  }

  if (placesQuery.isError) {
    return (
      <section className="py-10 md:py-12">
        <Container>
          <div className="card p-6">
            <p className="text-sm text-red-600 dark:text-red-400">
              Không tải được bản đồ yêu thương. Thử tải lại trang.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-12">
      <Container>
        <HeartMappingExperience places={placesQuery.data ?? []} />
      </Container>
    </section>
  );
}
