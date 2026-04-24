import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@shared/config";

export function createSupabaseAuthClient(accessToken?: string | null) {
  const env = getSupabasePublicEnv();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : undefined,
    }
  );
}
