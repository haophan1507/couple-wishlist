"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeSpecialDaysCron } from "@/lib/cron/special-days";

export async function sendSpecialDayTestEmailAction() {
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
    const result = await executeSpecialDaysCron();

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
