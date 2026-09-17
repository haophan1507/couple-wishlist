import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminServer } from "@/lib/auth/require-admin-server";
import { executeSpecialDaysCron } from "@/lib/cron/special-days";

export const sendManualEmailFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      recipients: z.string().optional(),
      customMessage: z.string().optional(),
      subject: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdminServer();

    const recipients = data.recipients
      ? data.recipients
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : undefined;

    const result = await executeSpecialDaysCron({
      customMessage: data.customMessage?.trim() || "",
      forceSend: true,
      recipients,
      skipLogs: true,
      subject: data.subject?.trim() || "",
    });

    const failureMessage = result.failures?.length
      ? result.failures.join("; ")
      : "";

    if (result.error || failureMessage) {
      return {
        ok: false as const,
        message: result.error || failureMessage,
      };
    }

    return {
      ok: true as const,
      sent: result.sent ?? 0,
      events: result.totalEvents ?? 0,
      reason: result.reason ?? "",
    };
  });
