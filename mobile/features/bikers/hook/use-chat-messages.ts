import { useQuery } from "@tanstack/react-query";

import {
  API_PATHS,
  DEFAULT_CHAT_MESSAGES_PAGE_SIZE,
  type ApiResponse,
  queryKeys,
  type TChatMessageListResponseData,
  type TChatMessagesQuery,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

type UseChatMessagesOptions = TChatMessagesQuery & {
  enabled?: boolean;
};

export function useChatMessages(
  chatId: string,
  { cursor, enabled = true, limit = DEFAULT_CHAT_MESSAGES_PAGE_SIZE }: UseChatMessagesOptions = {}
) {
  const params = {
    cursor,
    limit,
  };

  const searchParams = new URLSearchParams();
  if (cursor) {
    searchParams.set("cursor", cursor);
  }
  if (limit) {
    searchParams.set("limit", String(limit));
  }

  const endpoint = searchParams.size
    ? `${API_PATHS.bikers.chatMessages(chatId)}?${searchParams.toString()}`
    : API_PATHS.bikers.chatMessages(chatId);

  return useQuery<ApiResponse<TChatMessageListResponseData>>({
    queryKey: queryKeys.bikerChatMessages(chatId, params),
    queryFn: () => apiFetch.get<TChatMessageListResponseData>(endpoint),
    enabled: enabled && Boolean(chatId),
    placeholderData: (previousData) => previousData,
  });
}
