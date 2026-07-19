import { Suspense } from "react";
import { AdminContentFallback } from "@/components/admin/admin-content-fallback";
import { AdminWishlistPageContent } from "./wishlist-content";

export default function AdminWishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <AdminContentFallback
          title="Quản lý wishlist"
          description="Tạo mới và chỉnh sửa món quà, điều muốn có hoặc ý tưởng bất ngờ."
        />
      }
    >
      <AdminWishlistPageContent searchParams={searchParams} />
    </Suspense>
  );
}
