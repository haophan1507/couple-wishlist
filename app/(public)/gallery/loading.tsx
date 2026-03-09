import { PageLoading } from "@/components/ui/page-loading";

export default function GalleryLoading() {
  return <PageLoading title="Đang tải khoảnh khắc" description="Album ảnh đang được mở ra..." cards={6} />;
}
