import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Gift, MessageCircleHeart } from "lucide-react";
import { GiftHistoryCard } from "@/components/gift-history-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Container } from "@/components/ui/container";
import {
  fetchCoupleProfile,
  fetchGiftHistoryPage,
  fetchGiftHistoryStats,
  queryKeys,
} from "@/lib/data/client-queries";

const PAGE_SIZE = 10;

type GiftHistoryPageProps = {
  page: number;
};

export function GiftHistoryPage({ page }: GiftHistoryPageProps) {
  const profileQuery = useQuery({
    queryKey: queryKeys.coupleProfile,
    queryFn: fetchCoupleProfile,
  });
  const statsQuery = useQuery({
    queryKey: queryKeys.giftHistoryStats,
    queryFn: fetchGiftHistoryStats,
  });
  const listQuery = useQuery({
    queryKey: queryKeys.giftHistory({ page }),
    queryFn: () => fetchGiftHistoryPage(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  if (
    (profileQuery.isPending || statsQuery.isPending || listQuery.isPending) &&
    !listQuery.data
  ) {
    return (
      <section className="py-10 md:py-12">
        <Container>
          <h1 className="section-title">Kỷ niệm quà</h1>
          <p className="section-subtitle">
            Nhật ký nhỏ về những món quà hai bạn đã nhận và gửi.
          </p>
          <SectionSkeleton cards={6} />
        </Container>
      </section>
    );
  }

  const profile = profileQuery.data;
  const stats = statsQuery.data;
  const personOneName = profile?.person_one_name ?? "Bạn";
  const personTwoName = profile?.person_two_name ?? "Người thương";
  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = listQuery.data?.items ?? [];

  return (
    <section className="py-10 md:py-12">
      <Container>
        <h1 className="section-title">Kỷ niệm quà</h1>
        <p className="section-subtitle">
          Nhật ký nhỏ về những món quà hai bạn đã nhận và gửi.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-blush p-5 dark:bg-white/5">
            <p className="text-xs text-mocha/55 dark:text-white/45">Tổng món quà đã lưu</p>
            <p className="mt-2 text-3xl font-semibold dark:text-white">
              {stats?.total ?? 0}
            </p>
          </div>
          <div className="rounded-3xl bg-blush p-5 dark:bg-white/5">
            <p className="text-xs text-mocha/55 dark:text-white/45">Ảnh kỷ niệm đi kèm</p>
            <p className="mt-2 text-3xl font-semibold dark:text-white">
              {stats?.withPhotoCount ?? 0}
            </p>
          </div>
          <div className="rounded-3xl bg-blush p-5 dark:bg-white/5">
            <p className="text-xs text-mocha/55 dark:text-white/45">Đã gửi lời cảm ơn</p>
            <p className="mt-2 text-3xl font-semibold dark:text-white">
              {stats?.thankedCount ?? 0}
            </p>
          </div>
        </div>

        {total ? (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-rose" />
                  <div>
                    <p className="text-sm font-medium dark:text-white">{personOneName}</p>
                    <p className="text-xs text-mocha/65 dark:text-white/45">
                      Đã nhận {stats?.meCount ?? 0} món quà
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-rose" />
                  <div>
                    <p className="text-sm font-medium dark:text-white">{personTwoName}</p>
                    <p className="text-xs text-mocha/65 dark:text-white/45">
                      Đã nhận {stats?.honeyCount ?? 0} món quà
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <MessageCircleHeart className="h-5 w-5 text-rose" />
                  <div>
                    <p className="text-sm font-medium dark:text-white">Lưu bằng cảm xúc</p>
                    <p className="text-xs text-mocha/65 dark:text-white/45">
                      Ưu tiên ghi chú và bối cảnh hơn là trạng thái giao dịch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <GiftHistoryCard
                    key={item.id}
                    item={item}
                    recipientName={
                      item.recipient_owner_type === "me"
                        ? personOneName
                        : personTwoName
                    }
                  />
                ))}
              </div>
            </div>
            <PaginationControls
              basePath="/gift-history"
              currentPage={safePage}
              totalPages={totalPages}
              searchParams={{}}
            />
          </>
        ) : (
          <EmptyState
            className="mt-8"
            title="Chưa có kỷ niệm quà tặng nào được lưu"
            description="Khi hai bạn thêm món quà đã nhận trong quản trị, trang này sẽ trở thành một cuốn nhật ký nho nhỏ."
          />
        )}
      </Container>
    </section>
  );
}
