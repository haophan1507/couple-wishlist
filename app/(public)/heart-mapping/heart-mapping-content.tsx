import { HeartMappingExperience } from "@/components/heart-mapping-experience";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { getPlaceMemories } from "@/lib/data/queries";

export async function HeartMappingPageContent() {
  const places = await getPlaceMemories();
  return <HeartMappingExperience places={places} />;
}

export function HeartMappingContentFallback() {
  return <SectionSkeleton cards={3} withTitle />;
}
