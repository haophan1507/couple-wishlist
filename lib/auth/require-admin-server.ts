import { createSupabaseStartServerClient } from "@/lib/supabase/start-server";
import type { Database } from "@/types/database";

export async function requireAdminServer() {
  const supabase = createSupabaseStartServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile as { role: Database["public"]["Tables"]["profiles"]["Row"]["role"] } | null)
    ?.role;

  if (role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return { user };
}
