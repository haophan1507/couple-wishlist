import { PageLoading } from "@/components/ui/page-loading";

export default function AdminLoading() {
  return <PageLoading title="Đang tải trang quản trị" description="Đang chuẩn bị dữ liệu quản lý cho bạn..." cards={4} />;
}
