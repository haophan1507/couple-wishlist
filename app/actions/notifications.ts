"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildBaseUrl(host: string | null, forwardedHost: string | null, proto: string | null) {
  if (forwardedHost) {
    return `${proto ?? "https"}://${forwardedHost}`;
  }
  if (host) {
    const local = host.includes("localhost") || host.startsWith("127.0.0.1");
    return `${local ? "http" : "https"}://${host}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

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

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    redirect(`/admin?emailTest=error&message=${encodeURIComponent("Thiếu cấu hình CRON_SECRET")}`);
  }

  const headerStore = await headers();
  const baseUrl = buildBaseUrl(
    headerStore.get("host"),
    headerStore.get("x-forwarded-host"),
    headerStore.get("x-forwarded-proto"),
  );

  try {
    const response = await fetch(`${baseUrl}/api/cron/special-days`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      sent?: number;
      totalEvents?: number;
      reason?: string;
      error?: string;
    };

    if (!response.ok) {
      redirect(
        `/admin?emailTest=error&message=${encodeURIComponent(payload.error ?? "Gửi test email thất bại")}`,
      );
    }

    redirect(
      `/admin?emailTest=done&sent=${payload.sent ?? 0}&events=${payload.totalEvents ?? 0}&reason=${encodeURIComponent(payload.reason ?? "")}`,
    );
  } catch (error) {
    redirect(
      `/admin?emailTest=error&message=${encodeURIComponent(
        (error as Error).message || "Không thể chạy test email",
      )}`,
    );
  }
}
