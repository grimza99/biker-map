import type { QueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  queryKeys,
  type ApiResponse,
  type AppSession,
  type TChatMessage,
  type TChatMessageListResponseData,
  type TChatMessageRealtimeEvent,
  type TChatRoomResponseData,
} from "@package-shared/index";

import {
  fetchSupabaseBroadcastChannelConfig,
  type SupabaseBroadcastBinding,
} from "@/shared";

type CreateChatRealtimeBindingsOptions = {
  chatId: string;
  queryClient: QueryClient;
};

type UpsertChatMessageOptions = {
  chatId: string;
  message: TChatMessage;
  queryClient: QueryClient;
};

const CHAT_MESSAGES_QUERY_PREFIX = (
  chatId: string
): readonly ["bikers", "chats", string, "messages"] =>
  ["bikers", "chats", chatId, "messages"] as const;

export function createChatRealtimeBindings({
  chatId,
  queryClient,
}: CreateChatRealtimeBindingsOptions): SupabaseBroadcastBinding[] {
  return [
    {
      event: "chat:message",
      onMessage: (payload: unknown) => {
        const event = payload as TChatMessageRealtimeEvent;

        if (!event?.message || event.roomId !== chatId) {
          return;
        }

        upsertChatMessage({
          chatId,
          message: event.message,
          queryClient,
        });
      },
    },
  ];
}

export async function fetchChatRealtimeChannelConfig(chatId: string) {
  return fetchSupabaseBroadcastChannelConfig({
    expectedFeature: "chat",
    path: API_PATHS.bikers.chatRealtimeConfig(chatId),
    unsupportedMessage: "지원하지 않는 채팅 실시간 설정입니다.",
  });
}

export function createOptimisticChatMessage({
  body,
  chatId,
  clientMessageId,
  session,
}: {
  body: string;
  chatId: string;
  clientMessageId: string;
  session: AppSession;
}): TChatMessage {
  const createdAt = new Date().toISOString();

  return {
    id: `optimistic:${clientMessageId}`,
    roomId: chatId,
    authorId: session.userId,
    body,
    clientMessageId,
    createdAt,
    author: {
      userId: session.userId,
      nickname: session.name,
      avatarUrl: session.avatarUrl,
      bikeBrand: session.bikeBrand,
      bikeModel: session.bikeModel,
    },
  };
}

export function createClientMessageId() {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return randomUuid;
  }

  return `cmid:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

export function upsertChatMessage({
  chatId,
  message,
  queryClient,
}: UpsertChatMessageOptions) {
  queryClient.setQueriesData<ApiResponse<TChatMessageListResponseData>>(
    { queryKey: CHAT_MESSAGES_QUERY_PREFIX(chatId) },
    (current) => {
      if (!current) {
        return current;
      }

      const nextItems = upsertMessageItem(current.data.items, message);
      const hadMessage = current.data.items.some(
        (item) =>
          item.id === message.id ||
          item.clientMessageId === message.clientMessageId
      );

      return {
        ...current,
        data: {
          ...current.data,
          roomId: chatId,
          items: nextItems,
        },
        meta: current.meta
          ? {
              ...current.meta,
              total: hadMessage
                ? current.meta.total
                : (current.meta.total ?? current.data.items.length) + 1,
            }
          : current.meta,
      };
    }
  );

  queryClient.setQueryData<ApiResponse<TChatRoomResponseData>>(
    queryKeys.bikerChatRoom(chatId),
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          room: {
            ...current.data.room,
            updatedAt: message.createdAt,
            lastMessage: {
              id: message.id,
              roomId: message.roomId,
              authorId: message.authorId,
              body: message.body,
              createdAt: message.createdAt,
            },
          },
        },
      };
    }
  );
}

function upsertMessageItem(current: TChatMessage[], next: TChatMessage) {
  const filtered = current.filter(
    (item) =>
      item.id !== next.id && item.clientMessageId !== next.clientMessageId
  );

  return [next, ...filtered].sort(compareMessagesDesc);
}

function compareMessagesDesc(left: TChatMessage, right: TChatMessage) {
  const timeDelta =
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

  if (timeDelta !== 0) {
    return timeDelta;
  }

  return right.id.localeCompare(left.id);
}
