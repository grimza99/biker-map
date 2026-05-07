import { z } from "zod";

export const supabaseEnvKeys = {
  publicUrl: "NEXT_PUBLIC_SUPABASE_URL",
  publicPublishableKey: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
} as const;

export const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
});

export const supabaseServiceEnvSchema = supabasePublicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export type SupabasePublicEnv = z.infer<typeof supabasePublicEnvSchema>;
export type SupabaseServerEnv = SupabasePublicEnv & {
  SUPABASE_SERVICE_ROLE_KEY: string;
};

export const supabaseCookieOptions = {
  name: "biker-map-auth",
} as const;

export const refreshTokenCookieOptions = {
  name: "biker-map-refresh-token",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
} as const;

const runtimeSupabasePublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
};

function pickSupabasePublicEnv(
  env?: NodeJS.ProcessEnv
): Record<keyof SupabasePublicEnv, string | undefined> {
  if (!env) {
    return runtimeSupabasePublicEnv;
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  };
}

export function getSupabasePublicEnv(env?: NodeJS.ProcessEnv): SupabasePublicEnv {
  return supabasePublicEnvSchema.parse(pickSupabasePublicEnv(env));
}

export function getSupabaseServerEnv(
  env: NodeJS.ProcessEnv = process.env
): SupabaseServerEnv {
  const parsed = supabaseServiceEnvSchema.parse({
    ...pickSupabasePublicEnv(env),
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  });
  const serviceRoleKey = parsed.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다.");
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: parsed.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
  };
}
