import { PageLoading } from "@/components/ui/page-loading";

export default function WishlistLoading() {
  return <PageLoading title="Đang tải danh sách quà" description="Các món quà đang được hiển thị..." cards={6} />;
}
