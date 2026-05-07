import type {
  ReactionSummary,
  ReactionTargetType,
  ReactionType,
} from "@package-shared/types/reaction";
import { createSupabaseServiceClient } from "@shared/lib/supabase";

type ReactionTargetRow = {
  target_id: string;
  reaction: ReactionType;
};

function emptyReactionSummary(): ReactionSummary {
  return {
    likeCount: 0,
    dislikeCount: 0,
    myReaction: null,
  };
}

export async function loadReactionSummaryMap(
  targetType: ReactionTargetType,
  targetIds: string[],
  userId?: string | null
) {
  const uniqueTargetIds = Array.from(new Set(targetIds.filter(Boolean)));
  const summaryMap = new Map<string, ReactionSummary>();

  if (uniqueTargetIds.length === 0) {
    return summaryMap;
  }

  const supabase = createSupabaseServiceClient();

  const [{ data: likeRows, error: likeError }, { data: dislikeRows, error: dislikeError }] =
    await Promise.all([
      supabase
        .from("reactions")
        .select("target_id", { count: "exact" })
        .eq("target_type", targetType)
        .eq("reaction", "like")
        .in("target_id", uniqueTargetIds),
      supabase
        .from("reactions")
        .select("target_id", { count: "exact" })
        .eq("target_type", targetType)
        .eq("reaction", "dislike")
        .in("target_id", uniqueTargetIds),
    ]);

  if (likeError) {
    throw new Error(likeError.message);
  }

  if (dislikeError) {
    throw new Error(dislikeError.message);
  }

  const applyCount = (rows: ReactionTargetRow[] | null, reaction: ReactionType) => {
    const counts = new Map<string, number>();

    for (const row of rows ?? []) {
      const key = String(row.target_id ?? "");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    for (const targetId of uniqueTargetIds) {
      const current = summaryMap.get(targetId) ?? emptyReactionSummary();
      const nextCount = counts.get(targetId) ?? 0;
      summaryMap.set(targetId, {
        ...current,
        likeCount: reaction === "like" ? nextCount : current.likeCount,
        dislikeCount: reaction === "dislike" ? nextCount : current.dislikeCount,
      });
    }
  };

  applyCount((likeRows as ReactionTargetRow[] | null) ?? null, "like");
  applyCount((dislikeRows as ReactionTargetRow[] | null) ?? null, "dislike");

  if (userId) {
    const { data: myRows, error: myError } = await supabase
      .from("reactions")
      .select("target_id, reaction")
      .eq("target_type", targetType)
      .eq("user_id", userId)
      .in("target_id", uniqueTargetIds);

    if (myError) {
      throw new Error(myError.message);
    }

    for (const row of (myRows as ReactionTargetRow[] | null) ?? []) {
      const targetId = String(row.target_id ?? "");
      const current = summaryMap.get(targetId) ?? emptyReactionSummary();
      summaryMap.set(targetId, {
        ...current,
        myReaction: row.reaction,
      });
    }
  }

  for (const targetId of uniqueTargetIds) {
    if (!summaryMap.has(targetId)) {
      summaryMap.set(targetId, emptyReactionSummary());
    }
  }

  return summaryMap;
}

export async function loadSingleReactionSummary(
  targetType: ReactionTargetType,
  targetId: string,
  userId?: string | null
) {
  const map = await loadReactionSummaryMap(targetType, [targetId], userId);
  return map.get(targetId) ?? emptyReactionSummary();
}
