import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { GiftHistoryPage } from "@/src/features/gift-history/gift-history-page";

const searchSchema = z.object({
  page: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_public/gift-history")({
  validateSearch: searchSchema,
  component: GiftHistoryRoute,
});

function GiftHistoryRoute() {
  const { page } = Route.useSearch();
  return <GiftHistoryPage page={Math.max(1, Number(page ?? "1") || 1)} />;
}
