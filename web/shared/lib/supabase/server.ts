import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { getSupabasePublicEnv, supabaseCookieOptions } from "@shared/config";

export type SupabaseCookieMethods = CookieMethodsServer;

export function createSupabaseServerClient(cookies: SupabaseCookieMethods) {
  const env = getSupabasePublicEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies,
    cookieOptions: supabaseCookieOptions,
    cookieEncoding: "base64url"
  });
}

export type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;
