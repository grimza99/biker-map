export {
  createSupabaseMiddlewareClient,
  createSupabaseServerClient,
  createSupabaseApiClient,
} from "@shared/lib/supabase";
export { createSupabaseApiClient as createSupabaseServiceClient } from "@shared/lib/supabase";
export type {
  SupabaseCookieMethods,
  SupabaseMiddlewareCookies,
  SupabaseServerClient,
  SupabaseApiClient,
} from "@shared/lib/supabase";
export type { SupabaseApiClient as SupabaseServiceClient } from "@shared/lib/supabase";
