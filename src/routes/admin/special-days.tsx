import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AdminSpecialDaysPage } from "@/src/features/admin/admin-special-days-page";

const searchSchema = z.object({
  page: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/admin/special-days")({
  validateSearch: searchSchema,
  component: AdminSpecialDaysRoute,
});

function AdminSpecialDaysRoute() {
  const { page } = Route.useSearch();
  return <AdminSpecialDaysPage page={Math.max(1, Number(page ?? "1") || 1)} />;
}
