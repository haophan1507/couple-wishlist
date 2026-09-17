import { createFileRoute } from "@tanstack/react-router";
import { executeSpecialDaysCron } from "@/lib/cron/special-days";

async function handleCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!cronSecret || bearerToken !== cronSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await executeSpecialDaysCron();
  if (result.error) {
    return Response.json(result, { status: 500 });
  }

  return Response.json(result);
}

export const Route = createFileRoute("/api/cron/special-days")({
  server: {
    handlers: {
      GET: async ({ request }) => handleCron(request),
      POST: async ({ request }) => handleCron(request),
    },
  },
});
