import { Link } from "@tanstack/react-router";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { APP_SHORT_DESCRIPTION } from "@/lib/constants/app";

type HeroSectionProps = {
  names: string;
  coverImagePath?: string | null;
  coverImageUrl?: string | null;
  story: string | null;
};

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80";

export function HeroSection({
  names,
  coverImagePath,
  coverImageUrl,
  story,
}: HeroSectionProps) {
  return (
    <section className="pt-12 md:pt-16">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <div className="card flex flex-col justify-center p-8 md:p-12">
            <h1 className="font-(--font-heading) text-4xl leading-tight text-foreground md:text-6xl">
              {names}
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
              {story ?? APP_SHORT_DESCRIPTION}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-5">
                <Link to="/wishlist">Mở wishlist</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-5">
                <Link to="/special-days">Xem ngày đặc biệt</Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-soft dark:shadow-none">
            <AppImage
              path={coverImagePath}
              src={coverImagePath ? undefined : (coverImageUrl ?? FALLBACK_COVER)}
              alt="Ảnh bìa cặp đôi"
              variant="display"
              aspect="wide"
              priority
              className="min-h-[280px] rounded-2xl sm:min-h-[360px]"
              imgClassName="rounded-2xl"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
