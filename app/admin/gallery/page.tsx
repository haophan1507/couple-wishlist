import { Suspense } from "react";
import { AdminContentFallback } from "@/components/admin/admin-content-fallback";
import { AdminGalleryPageContent } from "./gallery-content";

export default function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<AdminContentFallback title="Quản lý Khoảnh khắc" />}>
      <AdminGalleryPageContent searchParams={searchParams} />
    </Suspense>
  );
}
