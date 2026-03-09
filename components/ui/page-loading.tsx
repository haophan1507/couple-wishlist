import { Heart } from "lucide-react";
import { Container } from "@/components/ui/container";

type PageLoadingProps = {
  title: string;
  description: string;
  cards?: number;
};

export function PageLoading({ title, description, cards = 3 }: PageLoadingProps) {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <div className="min-h-[58vh]">
          <div className="flex items-center gap-2 text-rose">
            <Heart className="h-4 w-4 animate-pulse" />
            <h2 className="text-2xl font-semibold font-[var(--font-heading)] dark:text-white">{title}</h2>
          </div>
          <p className="mt-2 text-sm text-mocha/70 dark:text-white/50">{description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: cards }).map((_, index) => (
              <div key={index} className="card overflow-hidden">
                <div className="h-44 animate-pulse bg-blush/60 dark:bg-white/10" />
                <div className="p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-blush/70 dark:bg-white/10" />
                  <div className="mt-3 h-3 w-full animate-pulse rounded bg-blush/50 dark:bg-white/5" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-blush/50 dark:bg-white/5" />
                  <div className="mt-5 h-9 animate-pulse rounded-xl bg-blush/70 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
