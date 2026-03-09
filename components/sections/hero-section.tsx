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
            <p className="inline-flex items-center gap-2 rounded-full bg-blush px-3 py-1 text-xs font-medium text-mocha/80">
              <Sparkles className="h-3.5 w-3.5" />
              Góc nhỏ của tụi mình
            </p>
            <h1 className="mt-5 font-[var(--font-heading)] text-4xl leading-tight md:text-6xl">{names}</h1>
            <p className="mt-4 max-w-xl text-mocha/80 md:text-lg">
              {story ?? "Một nơi lưu wishlist và kỷ niệm để cùng những người thân yêu chia sẻ hành trình của tụi mình."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/wishlist" className="rounded-full bg-mocha px-5 py-2.5 text-sm text-white transition hover:opacity-90">
                Xem Wishlist
              </Link>
              <Link href="/special-days" className="rounded-full border border-mocha/20 bg-white px-5 py-2.5 text-sm text-mocha transition hover:border-mocha/40">
                Xem Ngày Đặc Biệt
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-2 shadow-soft">
            <img
              src={
                coverImageUrl ??
                "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80"
              }
              alt="Ảnh bìa cặp đôi"
              className="h-full min-h-[360px] w-full rounded-2xl object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/85 p-4 backdrop-blur">
              <p className="text-sm font-medium">Wishlist và kỷ niệm</p>
              <p className="mt-1 text-sm text-mocha/70">Đặt trước quà, đếm ngày quan trọng và cùng chia sẻ niềm vui.</p>
              <ArrowRight className="mt-2 h-4 w-4 text-rose" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
