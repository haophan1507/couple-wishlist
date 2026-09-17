import { Container } from "@/components/ui/container";
import { APP_NAME, APP_SHORT_DESCRIPTION } from "@/lib/constants/app";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border pt-16 pb-8 text-sm text-muted-foreground">
      <Container className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <p>{APP_SHORT_DESCRIPTION}</p>
        <p>
          {new Date().getFullYear()} {APP_NAME}
        </p>
      </Container>
    </footer>
  );
}
