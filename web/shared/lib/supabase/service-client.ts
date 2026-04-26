import { createClient } from "@supabase/supabase-js";

import { getSupabaseServerEnv } from "@shared/config";

export function createSupabaseServiceClient() {
  const env = getSupabaseServerEnv();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    }
  );
}
