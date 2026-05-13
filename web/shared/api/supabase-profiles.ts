import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "@shared/lib/supabase";

export type ProfileStatus = {
  id: string;
  name: string;
  role: string;
  deletedAt: string | null;
};

export async function loadProfileNameMap(
  client: SupabaseClient,
  userIds: string[]
) {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (!ids.length) {
    return new Map<string, string>();
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, name")
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (data ?? []).map((row) => [String(row.id), String(row.name ?? "")])
  );
}

export async function getProfileStatus(userId: string): Promise<ProfileStatus | null> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("profiles")
    .select("id, name, role, deleted_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: String(data.id),
    name: String(data.name ?? ""),
    role: String(data.role ?? ""),
    deletedAt: data.deleted_at ? String(data.deleted_at) : null,
  };
}
