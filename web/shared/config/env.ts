import { getSupabasePublicEnv, supabaseEnvKeys } from "./supabase";

export const webEnvKeys = supabaseEnvKeys;

/**
 * Public web env validation entrypoint.
 * Call this at runtime where env access is expected rather than at module load.
 */
export function getWebEnv() {
  return getSupabasePublicEnv();
}

export type WebEnv = ReturnType<typeof getWebEnv>;
