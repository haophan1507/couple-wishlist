import Link from "next/link";
import { Gift } from "lucide-react";

type WishlistPreviewProps = {
  title: string;
  count: number;
  giftedCount: number;
};

export function WishlistPreview({ title, count, giftedCount }: WishlistPreviewProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        <Gift className="h-5 w-5 text-rose" />
      </div>
      <p className="mt-2 text-sm text-mocha/75 dark:text-white/60">{count} món quà</p>
      <p className="mt-1 text-sm text-mocha/75 dark:text-white/60">{giftedCount} món đã được tặng</p>
      <Link href="/wishlist" className="mt-5 inline-block text-sm font-medium text-mocha underline-offset-4 hover:underline dark:text-white/80">
        Mở wishlist
      </Link>
    </div>
  );
}
