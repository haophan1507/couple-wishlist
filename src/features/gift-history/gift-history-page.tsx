import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { GiftHistoryCard } from "@/components/gift-history-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageHeader } from "@/components/ui/page-header";
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

  const header = (
    <PageHeader
      title="Kỷ niệm quà"
      description="Nhật ký nhỏ về những món quà hai bạn đã nhận và gửi."
    />
  );

  if (
    (profileQuery.isPending || statsQuery.isPending || listQuery.isPending) &&
    !listQuery.data
  ) {
    return (
      <section className="py-10 md:py-12">
        <Container>
          {header}
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
        {header}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs text-muted-foreground">Tổng món quà</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {stats?.total ?? 0}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted-foreground">
              {personOneName} đã nhận
            </p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {stats?.meCount ?? 0}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted-foreground">
              {personTwoName} đã nhận
            </p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {stats?.honeyCount ?? 0}
            </p>
          </div>
        </div>

        {total ? (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
