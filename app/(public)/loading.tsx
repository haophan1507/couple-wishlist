import { PageLoading } from "@/components/ui/page-loading";

export default function PublicLoading() {
  return (
    <PageLoading
      title="Đang tải trang"
      description="Tụi mình đang chuẩn bị nội dung, bạn chờ một chút nhé."
      cards={6}
    />
  );
}
