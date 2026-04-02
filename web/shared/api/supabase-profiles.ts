import type { SupabaseClient } from "@supabase/supabase-js";

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
    throw error;
  }

  return new Map(
    (data ?? []).map((row) => [String(row.id), String(row.name ?? "")])
  );
}
