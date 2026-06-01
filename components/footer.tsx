import { Container } from "@/components/ui/container";
import { APP_NAME, APP_SHORT_DESCRIPTION } from "@/lib/constants/app";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/60 py-8 text-sm text-mocha/70 dark:border-white/10 dark:text-white/50">
      <Container className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <p>{APP_SHORT_DESCRIPTION}</p>
        <p>{new Date().getFullYear()} {APP_NAME}</p>
      </Container>
    </footer>
  );
}
