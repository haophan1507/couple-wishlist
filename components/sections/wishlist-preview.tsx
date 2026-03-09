import Link from "next/link";
import { Gift } from "lucide-react";

type WishlistPreviewProps = {
  title: string;
  count: number;
  reservedCount: number;
};

export function WishlistPreview({ title, count, reservedCount }: WishlistPreviewProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Gift className="h-5 w-5 text-rose" />
      </div>
      <p className="mt-2 text-sm text-mocha/75">{count} món quà</p>
      <p className="mt-1 text-sm text-mocha/75">{reservedCount} món đã được đặt trước</p>
      <Link href="/wishlist" className="mt-5 inline-block text-sm font-medium text-mocha underline-offset-4 hover:underline">
        Mở wishlist
      </Link>
    </div>
  );
}
