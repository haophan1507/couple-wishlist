import { Suspense } from "react";
import { AdminContentFallback } from "@/components/admin/admin-content-fallback";
import { AdminGiftHistoryPageContent } from "./gift-history-content";

export default function AdminGiftHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <AdminContentFallback
          title="Kỷ niệm quà"
          description="Lưu lại những món quà đã nhận như một phần ký ức của hai bạn."
        />
      }
    >
      <AdminGiftHistoryPageContent searchParams={searchParams} />
    </Suspense>
  );
}
