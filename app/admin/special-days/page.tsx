import { Suspense } from "react";
import { AdminContentFallback } from "@/components/admin/admin-content-fallback";
import { AdminSpecialDaysPageContent } from "./special-days-content";

export default function AdminSpecialDaysPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<AdminContentFallback title="Quản lý Ngày Đặc Biệt" />}>
      <AdminSpecialDaysPageContent searchParams={searchParams} />
    </Suspense>
  );
}
