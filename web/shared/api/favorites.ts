import type { FavoriteTargetType } from "@package-shared/types/favorite";

import type { SupabaseApiClient } from "@shared/lib/supabase";

export type FavoriteState = {
  favoriteId?: string;
  favorited: boolean;
};

export async function loadFavoriteState(
  supabase: SupabaseApiClient,
  targetType: FavoriteTargetType,
  targetId: string,
  userId?: string | null
): Promise<FavoriteState> {
  if (!userId) {
    return { favorited: false };
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    favoriteId: data?.id ? String(data.id) : undefined,
    favorited: Boolean(data?.id),
  };
}
