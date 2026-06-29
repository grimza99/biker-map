import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  queryKeys,
  type ApiResponse,
  type CreateReactionResponseData,
  type PostCommentsResponseData,
  type ReactionSummary,
  type ReactionTargetType,
  type ReactionType,
} from "@package-shared/index";
import { apiFetch } from "@/shared";

type ToggleReactionParams = {
  targetType: ReactionTargetType;
  targetId: string;
  reaction: ReactionType;
  postId?: string;
};

type ReactionMutationContext = {
  previousComments?: ApiResponse<PostCommentsResponseData> | undefined;
};

function createEmptyReactionSummary(): ReactionSummary {
  return {
    likeCount: 0,
    dislikeCount: 0,
    myReaction: null,
  };
}

function getNextReactionSummary(
  current: ReactionSummary | null | undefined,
  reaction: ReactionType
): ReactionSummary {
  const currentSummary = current ?? createEmptyReactionSummary();

  if (currentSummary.myReaction === reaction) {
    return {
      ...currentSummary,
      likeCount:
        reaction === "like"
          ? Math.max(currentSummary.likeCount - 1, 0)
          : currentSummary.likeCount,
      dislikeCount:
        reaction === "dislike"
          ? Math.max(currentSummary.dislikeCount - 1, 0)
          : currentSummary.dislikeCount,
      myReaction: null,
    };
  }

  if (currentSummary.myReaction === "like") {
    return {
      likeCount: Math.max(currentSummary.likeCount - 1, 0),
      dislikeCount: currentSummary.dislikeCount + 1,
      myReaction: "dislike",
    };
  }

  if (currentSummary.myReaction === "dislike") {
    return {
      likeCount: currentSummary.likeCount + 1,
      dislikeCount: Math.max(currentSummary.dislikeCount - 1, 0),
      myReaction: "like",
    };
  }

  return {
    likeCount:
      reaction === "like"
        ? currentSummary.likeCount + 1
        : currentSummary.likeCount,
    dislikeCount:
      reaction === "dislike"
        ? currentSummary.dislikeCount + 1
        : currentSummary.dislikeCount,
    myReaction: reaction,
  };
}

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
    onMutate: async (reaction): Promise<ReactionMutationContext> => {
      await (postId
        ? queryClient.cancelQueries({ queryKey: queryKeys.comments(postId) })
        : Promise.resolve());

      const previousComments = postId
        ? queryClient.getQueryData<ApiResponse<PostCommentsResponseData>>(
            queryKeys.comments(postId)
          )
        : undefined;

      if (postId) {
        queryClient.setQueryData<ApiResponse<PostCommentsResponseData>>(
          queryKeys.comments(postId),
          (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              data: {
                ...current.data,
                items: current.data.items.map((comment) => {
                  if (comment.id === targetId) {
                    return {
                      ...comment,
                      reactions: getNextReactionSummary(
                        comment.reactions,
                        reaction
                      ),
                    };
                  }

                  return {
                    ...comment,
                    replies: comment.replies.map((reply) =>
                      reply.id === targetId
                        ? {
                            ...reply,
                            reactions: getNextReactionSummary(
                              reply.reactions,
                              reaction
                            ),
                          }
                        : reply
                    ),
                  };
                }),
              },
            };
          }
        );
      }

      return { previousComments };
    },
    onError: (_error, _reaction, context) => {
      if (postId) {
        queryClient.setQueryData(
          queryKeys.comments(postId),
          context?.previousComments
        );
      }
    },
    onSettled: async () => {
      if (postId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.comments(postId),
        });
      }
    },
  });
}
