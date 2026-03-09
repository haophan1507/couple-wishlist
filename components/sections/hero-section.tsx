import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

type HeroSectionProps = {
  names: string;
  coverImageUrl: string | null;
  story: string | null;
};

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
            <h1 className="mt-5 font-[var(--font-heading)] text-4xl leading-tight dark:text-white md:text-6xl">{names}</h1>
            <p className="mt-4 max-w-xl text-mocha/80 dark:text-white/65 md:text-lg">
              {story ?? "Một nơi lưu wishlist và kỷ niệm để cùng những người thân yêu chia sẻ hành trình của tụi mình."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/wishlist" className="rounded-full bg-mocha px-5 py-2.5 text-sm text-white transition hover:opacity-90 dark:bg-white dark:text-[#1e1a1c] dark:hover:bg-white/90">
                Xem Wishlist
              </Link>
              <Link href="/special-days" className="rounded-full border border-mocha/20 bg-white px-5 py-2.5 text-sm text-mocha transition hover:border-mocha/40 dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10">
                Xem Ngày Đặc Biệt
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-2 shadow-soft dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <img
              src={
                coverImageUrl ??
                "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80"
              }
              alt="Ảnh bìa cặp đôi"
              className="h-full min-h-[280px] w-full rounded-2xl object-cover sm:min-h-[360px]"
            />
            <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/85 p-3 backdrop-blur sm:bottom-5 sm:left-5 sm:right-5 sm:p-4 dark:bg-[#1e1a1c]/85">
              <p className="text-sm font-medium dark:text-white">Wishlist và kỷ niệm</p>
              <p className="mt-1 text-xs text-mocha/70 sm:text-sm dark:text-white/60">Đặt trước quà, đếm ngày quan trọng và cùng chia sẻ niềm vui.</p>
              <ArrowRight className="mt-2 h-4 w-4 text-rose" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
