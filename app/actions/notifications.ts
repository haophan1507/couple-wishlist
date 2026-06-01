"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeSpecialDaysCron } from "@/lib/cron/special-days";

export async function sendSpecialDayTestEmailAction(formData: FormData) {
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
    const recipientInput = String(formData.get("recipient_emails") ?? "");
    const recipients = recipientInput
      ? recipientInput
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : undefined;
    const customMessage = String(formData.get("test_message") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();

    const result = await executeSpecialDaysCron({
      customMessage,
      forceSend: true,
      recipients,
      skipLogs: true,
      subject,
    });

    if (result.error) {
      redirectUrl = `/admin?emailTest=error&message=${encodeURIComponent(result.error)}`;
    } else {
      redirectUrl = `/admin?emailTest=done&sent=${result.sent ?? 0}&events=${result.totalEvents ?? 0}&reason=${encodeURIComponent(result.reason ?? "")}`;
    }
  } catch (error) {
    redirectUrl = `/admin?emailTest=error&message=${encodeURIComponent(
      (error as Error).message || "Không thể chạy test email",
    )}`;
  }

  redirect(redirectUrl);
}
