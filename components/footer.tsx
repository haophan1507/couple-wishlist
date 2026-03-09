import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/60 py-8 text-sm text-mocha/70">
      <Container className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <p>Một góc riêng để tụi mình chuẩn bị quà cho nhau.</p>
        <p>{new Date().getFullYear()} Wishlist Cặp Đôi</p>
      </Container>
    </footer>
  );
}
