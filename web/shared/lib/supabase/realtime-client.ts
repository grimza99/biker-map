"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@shared/config";

let realtimeClient: SupabaseClient | null = null;

export function createSupabaseRealtimeClient() {
  if (realtimeClient) {
    return realtimeClient;
  }

  const env = getSupabasePublicEnv();
  realtimeClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: false,
      },
    }
  );

  return realtimeClient;
}
