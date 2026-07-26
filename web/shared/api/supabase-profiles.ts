import type { SupabaseClient } from "@supabase/supabase-js";

import { Tproficiency } from "@package-shared/types";
import { createSupabaseServiceClient } from "@shared/lib/supabase";

type SessionProfileData = {
  id: string;
  role: string;
  deletedAt: string | null;
  isVerified: boolean;
};

type AppSessionProfileData = {
  bikeBrand: string | null;
  bikeModel: string | null;
  phone: string;
  proficiency: Tproficiency;
};

export async function loadProfileMap(
  client: SupabaseClient,
  userIds: string[]
) {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (!ids.length) {
    return new Map<string, { name: string; avatarUrl: string | null }>();
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (data ?? []).map((row) => [
      String(row.id),
      {
        name: String(row.name ?? ""),
        avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
      },
    ])
  );
}

async function getLatestVerifiedPhoneData(
  client: SupabaseClient,
  userId: string
) {
  const { data, error } = await client
    .from("sms_verifications")
    .select("phone_number,is_verified,created_at")
    .eq("user_id", userId)
    .eq("is_verified", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSessionProfileData(
  userId: string
): Promise<SessionProfileData | null> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("profiles")
    .select("id, role, deleted_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }
  const verifyData = await getLatestVerifiedPhoneData(client, userId);

  return {
    id: String(data.id),
    role: String(data.role ?? ""),
    deletedAt: data.deleted_at ? String(data.deleted_at) : null,
    isVerified: verifyData?.is_verified ?? false,
  };
}

export async function getAppSessionProfileData(
  userId: string
): Promise<AppSessionProfileData | null> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("profiles")
    .select("bike_brand,bike_model,proficiency")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const verifyData = await getLatestVerifiedPhoneData(client, userId);

  return {
    bikeBrand: data.bike_brand,
    bikeModel: data.bike_model,
    phone: verifyData?.phone_number ?? "",
    proficiency: data?.proficiency ?? null,
  };
}
