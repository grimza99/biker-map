import { z } from "zod";

export const supabaseEnvKeys = {
  publicUrl: "NEXT_PUBLIC_SUPABASE_URL",
  publicPublishableKey: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
} as const;

export const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1)
});

export type SupabasePublicEnv = z.infer<typeof supabasePublicEnvSchema>;

export const supabaseCookieOptions = {
  name: "biker-map-auth"
} as const;

export const refreshTokenCookieOptions = {
  name: "biker-map-refresh-token",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30
} as const;

export function getSupabasePublicEnv(env: NodeJS.ProcessEnv = process.env): SupabasePublicEnv {
  return supabasePublicEnvSchema.parse(env);
}
