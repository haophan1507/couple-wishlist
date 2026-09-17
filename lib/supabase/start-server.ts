import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { getSupabasePublicEnv } from "@/lib/supabase/public-env";
import type { Database } from "@/types/database";

export function createSupabaseStartServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  const cookieMap = getCookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return Object.entries(cookieMap).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>,
      ) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options);
        }
      },
    },
  });
}
