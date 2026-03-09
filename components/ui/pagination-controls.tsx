import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type PaginationControlsProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
  pageParam?: string;
  className?: string;
};

function createHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string | undefined>,
  pageParam: string,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value || key === pageParam) continue;
    params.set(key, value);
  }
  if (page > 1) {
    params.set(pageParam, String(page));
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function PaginationControls({
  basePath,
  currentPage,
  totalPages,
  searchParams = {},
  pageParam = "page",
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const windowStart = Math.max(1, currentPage - 2);
  const windowEnd = Math.min(totalPages, currentPage + 2);
  const pages: number[] = [];
  for (let page = windowStart; page <= windowEnd; page += 1) {
    pages.push(page);
  }

  const buttonClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-mocha/15 bg-white px-3 text-sm text-mocha transition hover:bg-blush dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10";

  return (
    <nav className={cn("mt-4 flex items-center justify-center gap-2", className)} aria-label="Pagination">
      <Link
        href={createHref(basePath, prevPage, searchParams, pageParam)}
        aria-disabled={currentPage === 1}
        className={cn(buttonClass, currentPage === 1 ? "pointer-events-none opacity-45" : "")}
      >
        Trước
      </Link>
      {pages.map((page) => (
        <Link
          key={page}
          href={createHref(basePath, page, searchParams, pageParam)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            buttonClass,
            page === currentPage
              ? "border-rose/35 bg-blush font-semibold text-mocha dark:bg-white/15"
              : "",
          )}
        >
          {page}
        </Link>
      ))}
      <Link
        href={createHref(basePath, nextPage, searchParams, pageParam)}
        aria-disabled={currentPage === totalPages}
        className={cn(
          buttonClass,
          currentPage === totalPages ? "pointer-events-none opacity-45" : "",
        )}
      >
        Sau
      </Link>
    </nav>
  );
}
