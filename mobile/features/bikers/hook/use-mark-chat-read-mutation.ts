import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  queryKeys,
  type TMarkChatReadResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

export function useMarkChatReadMutation(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lastReadMessageId?: string | null) =>
      apiFetch.patch<TMarkChatReadResponseData>(API_PATHS.bikers.chatRead(chatId), {
        lastReadMessageId: lastReadMessageId ?? null,
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bikerChatRoom(chatId),
      });

      queryClient.setQueryData(queryKeys.bikerChatRoom(chatId), response);
    },
  });
}
