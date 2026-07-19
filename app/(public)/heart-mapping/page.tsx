import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { HeartMappingContentFallback, HeartMappingPageContent } from "./heart-mapping-content";

export const metadata: Metadata = {
  title: "Bản đồ yêu thương",
  description: "Những nơi đã đi qua và những nơi hai bạn còn muốn cùng nhau ghé đến.",
};

export default function HeartMappingPage() {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <Suspense fallback={<HeartMappingContentFallback />}>
          <HeartMappingPageContent />
        </Suspense>
      </Container>
    </section>
  );
}
