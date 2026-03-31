import type { CookieMethodsServer } from "@supabase/ssr";
import { createSupabaseServerClient } from "./server";

export type SupabaseMiddlewareCookies = CookieMethodsServer;

/**
 * Middleware / Edge-compatible extension point.
 *
 * This stays thin so future `web/middleware.ts` or route handlers can plug in
 * the same cookie adapter without reimplementing Supabase wiring.
 */
export function createSupabaseMiddlewareClient(cookies: SupabaseMiddlewareCookies) {
  return createSupabaseServerClient(cookies);
}
