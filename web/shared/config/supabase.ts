import { z } from "zod";

export const supabaseEnvKeys = {
  publicUrl: "NEXT_PUBLIC_SUPABASE_URL",
  publicAnonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  serviceRoleKey: "SUPABASE_SERVICE_ROLE_KEY"
} as const;

export const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

export type SupabasePublicEnv = z.infer<typeof supabasePublicEnvSchema>;

export const supabaseCookieOptions = {
  name: "biker-map-auth"
} as const;

export function getSupabasePublicEnv(env: NodeJS.ProcessEnv = process.env): SupabasePublicEnv {
  return supabasePublicEnvSchema.parse(env);
}
