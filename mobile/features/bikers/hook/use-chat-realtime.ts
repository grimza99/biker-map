import { useSession } from "@/features/session/model";
import { useSupabaseBroadcastRealtime } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

import {
  createChatRealtimeBindings,
  fetchChatRealtimeChannelConfig,
} from "../lib/chat-realtime";

export function useChatRealtime(chatId: string, enabled = true) {
  const queryClient = useQueryClient();
  const { accessToken, user } = useSession();

  const realtimeEnabled = enabled && Boolean(chatId) && Boolean(user?.userId);
  const connectionKey = user?.userId ? `${user.userId}:${chatId}` : chatId;

  return useSupabaseBroadcastRealtime({
    accessToken,
    authMissingMessage: "채팅 실시간 연결에 필요한 인증 정보가 없습니다.",
    bindings: createChatRealtimeBindings({
      chatId,
      queryClient,
    }),
    connectionKey,
    disconnectedMessage: "채팅 실시간 연결이 끊어졌습니다.",
    enabled: realtimeEnabled,
    loadChannelConfig: () => fetchChatRealtimeChannelConfig(chatId),
  });
}
