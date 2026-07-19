import { Suspense } from "react";
import { AdminContentFallback } from "@/components/admin/admin-content-fallback";
import { AdminPlacesPageContent } from "./places-content";

export default function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<AdminContentFallback title="Bản đồ yêu thương" />}>
      <AdminPlacesPageContent searchParams={searchParams} />
    </Suspense>
  );
}
