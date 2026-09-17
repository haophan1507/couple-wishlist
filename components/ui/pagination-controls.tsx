import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils/cn";

type PaginationControlsProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
  pageParam?: string;
  className?: string;
};

function buildSearch(
  searchParams: Record<string, string | undefined>,
  pageParam: string,
  page: number,
) {
  const search: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value || key === pageParam) continue;
    search[key] = value;
  }
  if (page > 1) {
    search[pageParam] = String(page);
  }
  return search;
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
    <nav
      className={cn("mt-4 flex items-center justify-center gap-2", className)}
      aria-label="Pagination"
    >
      <Link
        to={basePath}
        search={buildSearch(searchParams, pageParam, prevPage)}
        aria-disabled={currentPage === 1}
        disabled={currentPage === 1}
        className={cn(buttonClass, currentPage === 1 ? "pointer-events-none opacity-45" : "")}
      >
        Trước
      </Link>
      {pages.map((page) => (
        <Link
          key={page}
          to={basePath}
          search={buildSearch(searchParams, pageParam, page)}
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
        to={basePath}
        search={buildSearch(searchParams, pageParam, nextPage)}
        aria-disabled={currentPage === totalPages}
        disabled={currentPage === totalPages}
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
