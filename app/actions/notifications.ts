"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeSpecialDaysCron } from "@/lib/cron/special-days";

export async function sendManualEmailAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/unauthorized");
  }

  let redirectUrl = "/admin";

  try {
    const recipientInput = String(formData.get("manual_email_recipients") ?? "");
    const recipients = recipientInput
      ? recipientInput
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : undefined;
    const customMessage = String(formData.get("manual_email_message") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();

    const result = await executeSpecialDaysCron({
      customMessage,
      forceSend: true,
      recipients,
      skipLogs: true,
      subject,
    });

    const failureMessage = result.failures?.length
      ? result.failures.join("; ")
      : "";

    if (result.error || failureMessage) {
      redirectUrl = `/admin?manualEmail=error&message=${encodeURIComponent(result.error || failureMessage)}`;
    } else {
      redirectUrl = `/admin?manualEmail=done&sent=${result.sent ?? 0}&events=${result.totalEvents ?? 0}&reason=${encodeURIComponent(result.reason ?? "")}`;
    }
  } catch (error) {
    redirectUrl = `/admin?manualEmail=error&message=${encodeURIComponent(
      (error as Error).message || "Không thể gửi email",
    )}`;
  }

  redirect(redirectUrl);
}
