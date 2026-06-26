"use client";

import { apiFetch, queryKeys } from "@shared/index";
import {
  API_PATHS,
  type ApiResponse,
  type CreateReactionResponseData,
  type PostCommentsResponseData,
  type ReactionSummary,
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

type ReactionMutationContext = {
  previousComments?: ApiResponse<PostCommentsResponseData> | undefined;
};

function isPostsListQueryKey(queryKey: readonly unknown[]) {
  return (
    queryKey[0] === queryKeys.postsRoot[0] &&
    queryKey.length > 1 &&
    typeof queryKey[1] === "object" &&
    queryKey[1] !== null
  );
}

function getNextReactionSummary(
  current: ReactionSummary,
  reaction: ReactionType
): ReactionSummary {
  if (current.myReaction === reaction) {
    return {
      ...current,
      likeCount:
        reaction === "like"
          ? Math.max(current.likeCount - 1, 0)
          : current.likeCount,
      dislikeCount:
        reaction === "dislike"
          ? Math.max(current.dislikeCount - 1, 0)
          : current.dislikeCount,
      myReaction: null,
    };
  }

  if (current.myReaction === "like") {
    return {
      likeCount: Math.max(current.likeCount - 1, 0),
      dislikeCount: current.dislikeCount + 1,
      myReaction: "dislike",
    };
  }

  if (current.myReaction === "dislike") {
    return {
      likeCount: current.likeCount + 1,
      dislikeCount: Math.max(current.dislikeCount - 1, 0),
      myReaction: "like",
    };
  }

  return {
    likeCount: reaction === "like" ? current.likeCount + 1 : current.likeCount,
    dislikeCount:
      reaction === "dislike" ? current.dislikeCount + 1 : current.dislikeCount,
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
      await Promise.all([
        queryClient.cancelQueries({
          predicate: (query) => isPostsListQueryKey(query.queryKey),
        }),
        postId
          ? queryClient.cancelQueries({ queryKey: queryKeys.comments(postId) })
          : Promise.resolve(),
      ]);

      const previousComments = postId
        ? queryClient.getQueryData<ApiResponse<PostCommentsResponseData>>(
            queryKeys.comments(postId)
          )
        : undefined;

      if (postId) {
        queryClient.setQueryData<ApiResponse<PostCommentsResponseData>>(
          queryKeys.comments(postId),
          (current) => {
            if (!current || targetType !== "comment") {
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

      return {
        previousComments,
      };
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
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => isPostsListQueryKey(query.queryKey),
        }),
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
