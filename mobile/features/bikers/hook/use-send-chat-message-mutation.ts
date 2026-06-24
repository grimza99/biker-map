import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  queryKeys,
  type TCreateChatMessageResponseData,
} from "@package-shared/index";

import { useSession } from "@/features/session/model";
import { apiFetch } from "@/shared";

import {
  createClientMessageId,
  createOptimisticChatMessage,
  upsertChatMessage,
} from "../lib/chat-realtime";

type SendChatMessageVariables = {
  body: string;
  clientMessageId: string;
};

export function useSendChatMessageMutation(chatId: string) {
  const queryClient = useQueryClient();
  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: ({ body, clientMessageId }: SendChatMessageVariables) =>
      apiFetch.post<TCreateChatMessageResponseData>(
        API_PATHS.bikers.chatMessages(chatId),
        {
          body,
          clientMessageId,
        }
      ),
    onMutate: async ({ body, clientMessageId }) => {
      if (!user) {
        throw new Error("채팅 메시지를 보낼 인증 정보가 없습니다.");
      }

      await queryClient.cancelQueries({
        queryKey: ["bikers", "chats", chatId, "messages"],
      });

      upsertChatMessage({
        chatId,
        message: createOptimisticChatMessage({
          body,
          chatId,
          clientMessageId,
          session: user,
        }),
        queryClient,
      });

      return { clientMessageId };
    },
    onError: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bikers", "chats", chatId, "messages"],
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.bikerChatRoom(chatId),
        }),
      ]);
    },
    onSuccess: (response) => {
      upsertChatMessage({
        chatId,
        message: response.data.message,
        queryClient,
      });
    },
  });

  async function sendMessage(body: string) {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      throw new Error("메시지를 입력해 주세요.");
    }

    if (!user) {
      throw new Error("채팅 메시지를 보낼 인증 정보가 없습니다.");
    }

    return mutation.mutateAsync({
      body: trimmedBody,
      clientMessageId: createClientMessageId(),
    });
  }

  return {
    ...mutation,
    sendMessage,
  };
}
