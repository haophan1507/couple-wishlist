import Link from "next/link";
import { Heart } from "lucide-react";
import { Container } from "@/components/ui/container";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-cream/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold font-[var(--font-heading)]">
          <Heart className="h-5 w-5 text-rose" />
          Wishlist Cặp Đôi
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <NavLinks />
          <ThemeToggle />
          <Link href="/login" className="rounded-full border border-mocha/20 px-4 py-2 text-sm hover:bg-white">
            Quản trị
          </Link>
        </nav>
      </Container>
    </header>
  );
}
