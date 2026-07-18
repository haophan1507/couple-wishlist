import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { APP_SHORT_DESCRIPTION } from "@/lib/constants/app";

type HeroSectionProps = {
  names: string;
  coverImageUrl: string | null;
  story: string | null;
};

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80";

export function HeroSection({ names, coverImageUrl, story }: HeroSectionProps) {
  return (
    <section className="pt-12 md:pt-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="card p-8 md:p-12">
            <p className="inline-flex items-center gap-2 rounded-full bg-blush px-3 py-1 text-xs font-medium text-mocha/80 dark:bg-white/10 dark:text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Góc nhỏ của tụi mình
            </p>
            <h1 className="mt-5 font-(--font-heading) text-4xl leading-tight dark:text-white md:text-6xl">{names}</h1>
            <p className="mt-4 max-w-xl text-mocha/80 dark:text-white/65 md:text-lg">
              {story ?? APP_SHORT_DESCRIPTION}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/wishlist" className="rounded-full bg-mocha px-5 py-2.5 text-sm text-white transition hover:opacity-90 dark:bg-white dark:text-[#1e1a1c] dark:hover:bg-white/90">
                Mở wishlist
              </Link>
              <Link href="/special-days" className="rounded-full border border-mocha/20 bg-white px-5 py-2.5 text-sm text-mocha transition hover:border-mocha/40 dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10">
                Xem ngày đặc biệt
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-2 shadow-soft dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <div className="relative min-h-[280px] w-full sm:min-h-[360px]">
              <Image
                src={coverImageUrl ?? FALLBACK_COVER}
                alt="Ảnh bìa cặp đôi"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="rounded-2xl object-cover"
              />
            </div>
            <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/85 p-3 backdrop-blur-sm sm:bottom-5 sm:left-5 sm:right-5 sm:p-4 dark:bg-[#1e1a1c]/85">
              <p className="text-sm font-medium dark:text-white">Wishlist, kỷ niệm và bản đồ yêu thương</p>
              <p className="mt-1 text-xs text-mocha/70 sm:text-sm dark:text-white/60">Một nơi để theo dõi điều muốn làm, ngày cần nhớ và những dấu mốc đã đi qua.</p>
              <ArrowRight className="mt-2 h-4 w-4 text-rose" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
