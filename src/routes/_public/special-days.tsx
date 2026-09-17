import { createFileRoute } from "@tanstack/react-router";
import { SpecialDaysPage } from "@/src/features/special-days/special-days-page";

export const Route = createFileRoute("/_public/special-days")({
  component: SpecialDaysPage,
});
