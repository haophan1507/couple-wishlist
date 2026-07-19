import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { GiftHistoryContentFallback, GiftHistoryPageContent } from "./gift-history-content";

export const metadata: Metadata = {
  title: "Kỷ niệm quà",
  description: "Nơi lưu lại những món quà đã nhận như một phần ký ức dịu dàng của hai bạn.",
};

export default function GiftHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <div className="card overflow-hidden p-8 md:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-blush px-3 py-1 text-xs dark:bg-white/10 dark:text-white/75">
            <Heart className="h-3.5 w-3.5" />
            Ký ức quà tặng
          </p>
          <h1 className="mt-4 section-title font-(--font-heading)">
            Những món quà đã đến và ở lại trong ký ức
          </h1>
          <p className="section-subtitle max-w-2xl">
            Không chỉ là món đồ được nhận, đây là nơi lưu lại cảm giác của ngày hôm đó, ai đã tặng,
            vào dịp nào, và lời nhắn đi cùng món quà.
          </p>
        </div>

        <Suspense fallback={<GiftHistoryContentFallback />}>
          <GiftHistoryPageContent searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}
