"use client";

import { apiFetch, queryKeys } from "@shared/index";
import {
  API_PATHS,
  type ApiResponse,
  type CreateReactionResponseData,
  type PostCommentsResponseData,
  type PostDetailResponseData,
  type PostsListResponseData,
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
  previousPosts?: Array<[readonly unknown[], ApiResponse<PostsListResponseData> | undefined]>;
  previousPostDetail?: ApiResponse<PostDetailResponseData> | undefined;
  previousComments?: ApiResponse<PostCommentsResponseData> | undefined;
};

function getNextReactionSummary(
  current: ReactionSummary,
  reaction: ReactionType
): ReactionSummary {
  if (current.myReaction === reaction) {
    return {
      ...current,
      likeCount:
        reaction === "like" ? Math.max(current.likeCount - 1, 0) : current.likeCount,
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
        queryClient.cancelQueries({ queryKey: ["posts"] }),
        postId
          ? queryClient.cancelQueries({ queryKey: queryKeys.post(postId) })
          : Promise.resolve(),
        postId
          ? queryClient.cancelQueries({ queryKey: queryKeys.comments(postId) })
          : Promise.resolve(),
      ]);

      const previousPosts = queryClient.getQueriesData<ApiResponse<PostsListResponseData>>({
        queryKey: ["posts"],
      });
      const previousPostDetail = postId
        ? queryClient.getQueryData<ApiResponse<PostDetailResponseData>>(
            queryKeys.post(postId)
          )
        : undefined;
      const previousComments = postId
        ? queryClient.getQueryData<ApiResponse<PostCommentsResponseData>>(
            queryKeys.comments(postId)
          )
        : undefined;

      queryClient.setQueriesData<ApiResponse<PostsListResponseData>>(
        { queryKey: ["posts"] },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            data: {
              ...current.data,
              items: current.data.items.map((item) =>
                targetType === "post" && item.id === targetId
                  ? {
                      ...item,
                      reactions: getNextReactionSummary(item.reactions, reaction),
                    }
                  : item
              ),
            },
          };
        }
      );

      if (postId) {
        queryClient.setQueryData<ApiResponse<PostDetailResponseData>>(
          queryKeys.post(postId),
          (current) => {
            if (!current || targetType !== "post" || current.data.id !== targetId) {
              return current;
            }

            return {
              ...current,
              data: {
                ...current.data,
                reactions: getNextReactionSummary(current.data.reactions, reaction),
              },
            };
          }
        );

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
                      reactions: getNextReactionSummary(comment.reactions, reaction),
                    };
                  }

                  return {
                    ...comment,
                    replies: comment.replies.map((reply) =>
                      reply.id === targetId
                        ? {
                            ...reply,
                            reactions: getNextReactionSummary(reply.reactions, reaction),
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
        previousPosts,
        previousPostDetail,
        previousComments,
      };
    },
    onError: (_error, _reaction, context) => {
      for (const [queryKey, data] of context?.previousPosts ?? []) {
        queryClient.setQueryData(queryKey, data);
      }

      if (postId) {
        queryClient.setQueryData(queryKeys.post(postId), context?.previousPostDetail);
        queryClient.setQueryData(
          queryKeys.comments(postId),
          context?.previousComments
        );
      }
    },
    onSettled: async () => {
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
