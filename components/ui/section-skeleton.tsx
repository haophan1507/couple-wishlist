import { Container } from "@/components/ui/container";

type SectionSkeletonProps = {
  cards?: number;
  withTitle?: boolean;
};

export function SectionSkeleton({ cards = 6, withTitle = false }: SectionSkeletonProps) {
  return (
    <div className={withTitle ? "py-10 md:py-12" : "mt-8"}>
      {withTitle ? (
        <Container>
          <div className="h-9 w-48 animate-pulse rounded-sm bg-blush/70 dark:bg-white/10" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-sm bg-blush/50 dark:bg-white/5" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: cards }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </Container>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="h-44 animate-pulse bg-blush/60 dark:bg-white/10" />
      <div className="p-5">
        <div className="h-4 w-2/3 animate-pulse rounded-sm bg-blush/70 dark:bg-white/10" />
        <div className="mt-3 h-3 w-full animate-pulse rounded-sm bg-blush/50 dark:bg-white/5" />
        <div className="mt-2 h-3 w-4/5 animate-pulse rounded-sm bg-blush/50 dark:bg-white/5" />
        <div className="mt-5 h-9 animate-pulse rounded-xl bg-blush/70 dark:bg-white/10" />
      </div>
    </div>
  );
}
