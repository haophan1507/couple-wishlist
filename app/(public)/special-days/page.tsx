import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { SpecialDaysContentFallback, SpecialDaysPageContent } from "./special-days-content";

export const metadata: Metadata = {
  title: "Ngày đặc biệt",
  description: "Đếm ngày yêu nhau, cột mốc tình yêu và lịch kỷ niệm của hai bạn.",
};

export default function SpecialDaysPage() {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title font-(--font-heading)">Ngày đặc biệt</h1>
        <p className="section-subtitle">
          Tự động đếm hành trình yêu và kết hợp với những ngày hai bạn tự thêm vào.
        </p>

        <Suspense fallback={<SpecialDaysContentFallback />}>
          <SpecialDaysPageContent />
        </Suspense>
      </Container>
    </section>
  );
}
