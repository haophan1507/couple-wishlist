function readEnv(key: string): string | undefined {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const fromVite = import.meta.env[key];
    if (typeof fromVite === "string" && fromVite.length > 0) {
      return fromVite;
    }
  }

  if (typeof process !== "undefined" && process.env) {
    const fromProcess = process.env[key];
    if (typeof fromProcess === "string" && fromProcess.length > 0) {
      return fromProcess;
    }
  }

  return undefined;
}

export function getSupabasePublicEnv() {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { supabaseUrl, supabaseAnonKey };
}
