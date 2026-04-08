import { apiFetch, queryKeys } from "@/shared";
import { API_PATHS, PostCommentsResponseData } from "@package-shared/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCommunityPostComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: async () =>
      apiFetch<PostCommentsResponseData>(API_PATHS.community.comments(postId)),
    enabled: Boolean(postId),
  });
}

export function useCreatePostComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) =>
      apiFetch(API_PATHS.community.comments(postId), {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.post(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts(),
      });
    },
  });
}
