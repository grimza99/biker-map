import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let realtimeClient: SupabaseClient | null = null;

export function createSupabaseRealtimeClient() {
  if (realtimeClient) {
    return realtimeClient;
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl) {
    throw new Error("EXPO_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다.");
  }

  if (!publishableKey) {
    throw new Error(
      "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY 환경변수가 설정되지 않았습니다."
    );
  }

  realtimeClient = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return realtimeClient;
}
