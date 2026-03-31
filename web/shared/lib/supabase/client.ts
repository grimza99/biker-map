import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@shared/config";

export function createSupabaseBrowserClient() {
  const env = getSupabasePublicEnv();

  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    isSingleton: true,
    cookieEncoding: "base64url"
  });
}

export type SupabaseBrowserClient = ReturnType<typeof createSupabaseBrowserClient>;
