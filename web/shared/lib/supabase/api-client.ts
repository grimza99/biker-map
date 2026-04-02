import { getSupabasePublicEnv } from "@shared/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseApiClient(request?: Request) {
  const env = getSupabasePublicEnv();
  const accessToken = getBearerToken(request);

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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

export type SupabaseApiClient = SupabaseClient;

function getBearerToken(request?: Request) {
  if (!request) {
    return null;
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}
