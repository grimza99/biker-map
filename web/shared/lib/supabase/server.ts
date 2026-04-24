import { getSupabasePublicEnv, supabaseCookieOptions } from "@shared/config";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

export type SupabaseCookieMethods = CookieMethodsServer;

export function createSupabaseServerClient(cookies: SupabaseCookieMethods) {
  const env = getSupabasePublicEnv();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies,
      cookieOptions: supabaseCookieOptions,
      cookieEncoding: "base64url",
    }
  );
}

export type SupabaseServerClient = ReturnType<
  typeof createSupabaseServerClient
>;
