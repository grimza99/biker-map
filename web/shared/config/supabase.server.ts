import { z } from "zod";
import { supabasePublicEnvSchema } from "./supabase";

export const supabaseServerEnvSchema = supabasePublicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

export type SupabaseServerEnv = z.infer<typeof supabaseServerEnvSchema>;

export function getSupabaseServerEnv(env: NodeJS.ProcessEnv = process.env): SupabaseServerEnv {
  return supabaseServerEnvSchema.parse(env);
}
