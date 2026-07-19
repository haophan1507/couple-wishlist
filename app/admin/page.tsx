import { Suspense } from "react";
import { AdminContentFallback } from "@/components/admin/admin-content-fallback";
import { AdminHomePageContent } from "./admin-home-content";

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    manualEmail?: string;
    sent?: string;
    events?: string;
    reason?: string;
    message?: string;
  }>;
}) {
  return (
    <Suspense
      fallback={
        <AdminContentFallback
          title="Bảng điều khiển"
          description="Tổng quan không gian riêng của hai bạn: wishlist, kỷ niệm quà, ngày đặc biệt, ảnh và địa điểm yêu thương."
        />
      }
    >
      <AdminHomePageContent searchParams={searchParams} />
    </Suspense>
  );
}
