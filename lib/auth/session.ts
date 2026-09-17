import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type ProfileRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export type AdminSession = {
  userId: string;
  email: string | undefined;
  role: ProfileRole;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile as { role: ProfileRole } | null)?.role;
  if (role !== "admin") {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role,
  };
}

export async function getAuthUser() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
