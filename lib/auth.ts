import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const safeProfile = profile as Pick<Database["public"]["Tables"]["profiles"]["Row"], "role"> | null;

  if (!safeProfile || safeProfile.role !== "admin") {
    redirect("/unauthorized");
  }

  return { user };
}
