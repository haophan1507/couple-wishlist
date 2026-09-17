import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AdminGiftHistoryPage } from "@/src/features/admin/admin-gift-history-page";

const searchSchema = z.object({
  page: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/admin/gift-history")({
  validateSearch: searchSchema,
  component: AdminGiftHistoryRoute,
});

function AdminGiftHistoryRoute() {
  const { page } = Route.useSearch();
  return (
    <AdminGiftHistoryPage page={Math.max(1, Number(page ?? "1") || 1)} />
  );
}
