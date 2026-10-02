import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { APP_NAME } from "@/lib/constants/app";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 py-1 font-heading text-lg font-semibold whitespace-nowrap text-foreground"
        >
          <Heart className="h-5 w-5 text-rose" />
          {APP_NAME}
        </Link>
        <nav className="hidden items-center gap-3 xl:flex">
          <NavLinks />
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="h-8 px-4 text-sm">
            <Link to="/login">Quản trị</Link>
          </Button>
        </nav>
        <MobileMenu />
      </Container>
    </header>
  );
}
