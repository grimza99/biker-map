import { useSession } from "@/features/session/model";
import { useSupabaseBroadcastRealtime } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import {
  createChatRealtimeBindings,
  fetchChatRealtimeChannelConfig,
} from "../lib/chat-realtime";

export function useChatRealtime(chatId: string, enabled = true) {
  const queryClient = useQueryClient();
  const { accessToken, user } = useSession();
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const typingTimeoutMapRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );
  const typingStateRef = useRef(false);
  const lastPresenceJoinSentAtRef = useRef(0);

  const realtimeEnabled = enabled && Boolean(chatId) && Boolean(user?.userId);
  const connectionKey = user?.userId ? `${user.userId}:${chatId}` : chatId;

  const realtime = useSupabaseBroadcastRealtime({
    accessToken,
    authMissingMessage: "채팅 실시간 연결에 필요한 인증 정보가 없습니다.",
    bindings: createChatRealtimeBindings({
      chatId,
      currentUserId: user?.userId,
      onPresenceEvent: (event) => {
        if (event.status === "leave") {
          setOnlineUserIds((current) =>
            current.filter((userId) => userId !== event.userId)
          );
          clearTypingIndicator(event.userId);
          return;
        }

        setOnlineUserIds((current) =>
          current.includes(event.userId) ? current : [...current, event.userId]
        );

        if (Date.now() - lastPresenceJoinSentAtRef.current > 5000) {
          void sendPresence("join");
        }
      },
      onTypingEvent: (event) => {
        if (!event.isTyping) {
          clearTypingIndicator(event.userId);
          return;
        }

        setTypingUserIds((current) =>
          current.includes(event.userId) ? current : [...current, event.userId]
        );

        const currentTimeout = typingTimeoutMapRef.current.get(event.userId);
        if (currentTimeout) {
          clearTimeout(currentTimeout);
        }

        typingTimeoutMapRef.current.set(
          event.userId,
          setTimeout(() => {
            clearTypingIndicator(event.userId);
          }, 2500)
        );
      },
      queryClient,
    }),
    connectionKey,
    disconnectedMessage: "채팅 실시간 연결이 끊어졌습니다.",
    enabled: realtimeEnabled,
    loadChannelConfig: () => fetchChatRealtimeChannelConfig(chatId),
  });

  useEffect(() => {
    if (!realtimeEnabled) {
      setOnlineUserIds([]);
      setTypingUserIds([]);
      typingStateRef.current = false;
      clearAllTypingIndicators();
    }
  }, [realtimeEnabled]);

  useEffect(() => {
    if (realtime.isConnected) {
      return;
    }

    setOnlineUserIds([]);
    setTypingUserIds([]);
    typingStateRef.current = false;
    clearAllTypingIndicators();
  }, [realtime.isConnected]);

  useEffect(() => {
    if (!realtime.isConnected || !chatId || !user?.userId) {
      return;
    }

    void sendPresence("join");

    return () => {
      void sendTyping(false);
      void sendPresence("leave");
    };
  }, [chatId, realtime.isConnected, user?.userId]);

  async function sendPresence(status: "join" | "leave") {
    if (!chatId || !user?.userId || !realtime.isConnected) {
      return;
    }

    if (status === "join") {
      lastPresenceJoinSentAtRef.current = Date.now();
    }

    try {
      await realtime.broadcast("chat:presence", {
        type: "chat:presence",
        roomId: chatId,
        userId: user.userId,
        status,
        sentAt: new Date().toISOString(),
      });
    } catch {
      // presence 이벤트 실패는 연결 자체를 깨지 않도록 무시한다.
    }
  }

  async function sendTyping(isTyping: boolean) {
    if (!chatId || !user?.userId || !realtime.isConnected) {
      return;
    }

    if (typingStateRef.current === isTyping) {
      return;
    }

    typingStateRef.current = isTyping;

    try {
      await realtime.broadcast("chat:typing", {
        type: "chat:typing",
        roomId: chatId,
        userId: user.userId,
        isTyping,
        sentAt: new Date().toISOString(),
      });
    } catch {
      // typing 이벤트 실패는 연결 자체를 깨지 않도록 무시한다.
    }
  }

  function notifyTyping(shouldType: boolean) {
    if (!shouldType) {
      clearOwnTypingTimer();
      void sendTyping(false);
      return;
    }

    void sendTyping(true);
    clearOwnTypingTimer();
    typingTimeoutMapRef.current.set(
      "__self__",
      setTimeout(() => {
        void sendTyping(false);
      }, 1500)
    );
  }

  function clearTypingIndicator(userId: string) {
    const currentTimeout = typingTimeoutMapRef.current.get(userId);
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      typingTimeoutMapRef.current.delete(userId);
    }

    setTypingUserIds((current) => current.filter((item) => item !== userId));
  }

  function clearAllTypingIndicators() {
    typingTimeoutMapRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    typingTimeoutMapRef.current.clear();
  }

  function clearOwnTypingTimer() {
    const selfTimeout = typingTimeoutMapRef.current.get("__self__");
    if (!selfTimeout) {
      return;
    }

    clearTimeout(selfTimeout);
    typingTimeoutMapRef.current.delete("__self__");
  }

  return {
    ...realtime,
    notifyTyping,
    onlineUserIds,
    typingUserIds,
  };
}
