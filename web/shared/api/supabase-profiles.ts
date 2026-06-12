import { createSupabaseServiceClient } from "@shared/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileStatus = {
  id: string;
  name: string;
  role: string;
  deletedAt: string | null;
  bikeBrand: string | null;
  bikeModel: string | null;
  phone: string;
  isVerified: boolean;
  verificationExpiresAt: string;
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

export async function getProfileStatus(
  userId: string
): Promise<ProfileStatus | null> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("profiles")
    .select("id, name, role, deleted_at, bike_brand,bike_model")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }
  const { data: verifyData, error: selectVerifyDataError } = await client
    .from("sms_verifications")
    .select("phone_number,expires_at,is_verified,created_at")
    .eq("user_id", userId)
    .eq("is_verified", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectVerifyDataError) {
    throw new Error(selectVerifyDataError.message);
  }

  return {
    id: String(data.id),
    name: String(data.name ?? ""),
    role: String(data.role ?? ""),
    deletedAt: data.deleted_at ? String(data.deleted_at) : null,
    bikeBrand: data.bike_brand,
    bikeModel: data.bike_model,
    phone: verifyData?.phone_number ?? "",
    isVerified: verifyData?.is_verified ?? false,
    verificationExpiresAt: verifyData?.expires_at ?? "",
  };
}
