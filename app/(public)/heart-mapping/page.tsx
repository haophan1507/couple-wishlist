import type { Metadata } from "next";
import { HeartMappingExperience } from "@/components/heart-mapping-experience";
import { Container } from "@/components/ui/container";
import { getPlaceMemories } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Heart Mapping",
  description: "Những nơi đã đi qua và những nơi hai bạn còn muốn cùng nhau ghé đến.",
};

export default async function HeartMappingPage() {
  const places = await getPlaceMemories();

  return (
    <section className="py-10 md:py-12">
      <Container>
        <HeartMappingExperience places={places} />
      </Container>
    </section>
  );
}
