import { Gift, MessageCircleHeart } from "lucide-react";
import { GiftHistoryCard } from "@/components/gift-history-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { getCoupleProfile, getGiftHistoryItems } from "@/lib/data/queries";

export async function GiftHistoryPageContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [params, profile, items] = await Promise.all([
    searchParams,
    getCoupleProfile(),
    getGiftHistoryItems(),
  ]);
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  const personOneName = profile?.person_one_name ?? "Bạn";
  const personTwoName = profile?.person_two_name ?? "Người thương";
  const thankedCount = items.filter((item) => item.status === "thanked").length;
  const withPhotoCount = items.filter((item) => item.photo_url).length;

  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-blush p-5 dark:bg-white/5">
          <p className="text-xs text-mocha/55 dark:text-white/45">Tổng món quà đã lưu</p>
          <p className="mt-2 text-3xl font-semibold dark:text-white">{items.length}</p>
        </div>
        <div className="rounded-3xl bg-blush p-5 dark:bg-white/5">
          <p className="text-xs text-mocha/55 dark:text-white/45">Ảnh kỷ niệm đi kèm</p>
          <p className="mt-2 text-3xl font-semibold dark:text-white">{withPhotoCount}</p>
        </div>
        <div className="rounded-3xl bg-blush p-5 dark:bg-white/5">
          <p className="text-xs text-mocha/55 dark:text-white/45">Đã gửi lời cảm ơn</p>
          <p className="mt-2 text-3xl font-semibold dark:text-white">{thankedCount}</p>
        </div>
      </div>

      {items.length ? (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-rose" />
                <div>
                  <p className="text-sm font-medium dark:text-white">{personOneName}</p>
                  <p className="text-xs text-mocha/65 dark:text-white/45">
                    Đã nhận {items.filter((item) => item.recipient_owner_type === "me").length} món
                    quà
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
                    Đã nhận{" "}
                    {items.filter((item) => item.recipient_owner_type === "honey").length} món quà
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
              {paginatedItems.map((item) => (
                <GiftHistoryCard
                  key={item.id}
                  item={item}
                  recipientName={
                    item.recipient_owner_type === "me" ? personOneName : personTwoName
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
        <div className="card mt-8 p-8 text-center">
          <p className="text-lg font-medium dark:text-white">Chưa có kỷ niệm quà tặng nào được lưu.</p>
          <p className="mt-2 text-sm text-mocha/70 dark:text-white/55">
            Khi hai bạn thêm món quà đã nhận trong quản trị, trang này sẽ trở thành một cuốn nhật ký
            nho nhỏ.
          </p>
        </div>
      )}
    </>
  );
}

export function GiftHistoryContentFallback() {
  return <SectionSkeleton cards={6} />;
}
