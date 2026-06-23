import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  queryKeys,
  type CreatePostBody,
  type CreatePostResponseData,
  type UpdatePostBody,
  type UpdatePostResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

/**----------------------------------create post------------------------------------- */

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostBody) =>
      apiFetch.post<CreatePostResponseData>(API_PATHS.community.posts, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.postsRoot }),
        queryClient.invalidateQueries({ queryKey: ["me", "posts"] }),
      ]);
    },
  });
}

/**----------------------------------update post------------------------------------- */

export function useUpdateCommunityPost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePostBody) =>
      apiFetch.patch<UpdatePostResponseData>(
        API_PATHS.community.post(postId),
        payload
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.postsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) }),
        queryClient.invalidateQueries({ queryKey: ["me", "posts"] }),
      ]);
    },
  });
}
