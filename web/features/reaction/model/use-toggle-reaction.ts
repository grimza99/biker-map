"use client";

import { apiFetch, queryKeys } from "@shared/index";
import {
  API_PATHS,
  type CreateReactionResponseData,
  type ReactionTargetType,
  type ReactionType,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ToggleReactionParams = {
  targetType: ReactionTargetType;
  targetId: string;
  reaction: ReactionType;
  postId?: string;
};

export function useToggleReaction({
  targetType,
  targetId,
  postId,
}: Omit<ToggleReactionParams, "reaction">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reaction: ReactionType) =>
      apiFetch<CreateReactionResponseData>(API_PATHS.reactions.create, {
        method: "POST",
        body: JSON.stringify({
          targetType,
          targetId,
          reaction,
        }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        postId
          ? queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) })
          : Promise.resolve(),
        postId
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.comments(postId),
            })
          : Promise.resolve(),
      ]);
    },
  });
}
