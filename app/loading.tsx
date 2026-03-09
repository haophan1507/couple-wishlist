import { PageLoading } from "@/components/ui/page-loading";

export default function Loading() {
  return <PageLoading title="Đang chuẩn bị trang" description="Tụi mình đang tải dữ liệu, bạn chờ một chút nhé." cards={3} />;
}
