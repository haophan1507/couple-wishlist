import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  return createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
