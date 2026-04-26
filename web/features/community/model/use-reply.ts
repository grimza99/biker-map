import { apiFetch, queryKeys } from "@/shared";
import { API_PATHS } from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCommentReply(postId: string, commentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!commentId) throw new Error("댓글 ID가 필요합니다.");
      return apiFetch(API_PATHS.community.reply(commentId), {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: async () => {
      if (!commentId) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.post(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts(),
      });
    },
  });
}
