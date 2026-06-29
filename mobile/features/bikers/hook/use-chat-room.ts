import { useQuery } from "@tanstack/react-query";

import {
  API_PATHS,
  type ApiResponse,
  queryKeys,
  type TChatRoomResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

type UseChatRoomOptions = {
  enabled?: boolean;
  refetchIntervalMs?: number;
};

export function useChatRoom(
  chatId: string,
  { enabled = true, refetchIntervalMs }: UseChatRoomOptions = {}
) {
  return useQuery<ApiResponse<TChatRoomResponseData>>({
    queryKey: queryKeys.bikerChatRoom(chatId),
    queryFn: () =>
      apiFetch.get<TChatRoomResponseData>(API_PATHS.bikers.chatRoom(chatId)),
    enabled: enabled && Boolean(chatId),
    refetchInterval: refetchIntervalMs,
  });
}
