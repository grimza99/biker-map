import { useLocalSearchParams } from "expo-router";

import {
  Message,
  useChatMessages,
  useMarkChatReadMutation,
  useChatRealtime,
  useChatRoom,
  useSendChatMessageMutation,
} from "@/features/bikers";
import { Button, Chip, Input } from "@/components/common";
import { useSession } from "@/features/session/model";
import { bikerMapTheme, type TChatMessage } from "@package-shared/index";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AppText, BouncingDots, cn } from "@/shared";
import dayjs from "@/shared/lib/day-js";

export default function BikerChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const [message, setMessage] = useState("");
  const { user } = useSession();

  const roomQuery = useChatRoom(chatId ?? "");
  const messagesQuery = useChatMessages(chatId ?? "");
  const markChatReadMutation = useMarkChatReadMutation(chatId ?? "");
  const sendMessageMutation = useSendChatMessageMutation(chatId ?? "");
  const realtime = useChatRealtime(chatId ?? "", Boolean(chatId));
  const { isPending: isMarkingChatRead, mutateAsync: markChatRead } =
    markChatReadMutation;

  const room = roomQuery.data?.data.room ?? null;
  const currentUserId = user?.userId ?? null;
  const messages = useMemo(
    () =>
      [...(messagesQuery.data?.data.items ?? [])].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime()
      ),
    [messagesQuery.data?.data.items]
  );

  const counterpart = useMemo(
    () =>
      room?.participants.find(
        (participant) => participant.userId !== currentUserId
      ) ?? null,
    [currentUserId, room?.participants]
  );

  const isCounterpartOnline = counterpart
    ? realtime.onlineUserIds.includes(counterpart.userId)
    : false;
  const isCounterpartTyping = counterpart
    ? realtime.typingUserIds.includes(counterpart.userId)
    : false;
  const latestIncomingMessage = useMemo(
    () =>
      [...messages].reverse().find((item) => item.authorId !== currentUserId) ??
      null,
    [currentUserId, messages]
  );
  const latestReadableMessageId = useMemo(() => {
    if (!currentUserId) {
      return latestIncomingMessage?.id ?? null;
    }

    if (room?.lastMessage && room.lastMessage.authorId !== currentUserId) {
      return room.lastMessage.id;
    }

    return latestIncomingMessage?.id ?? null;
  }, [currentUserId, latestIncomingMessage?.id, room?.lastMessage]);

  useEffect(() => {
    if (!chatId || !room || !latestReadableMessageId || isMarkingChatRead) {
      return;
    }

    if (room.viewerUnreadCount === 0) {
      return;
    }

    void markChatRead(latestReadableMessageId).catch(() => {
      // 읽음 처리 실패는 화면을 깨지 않도록 무시하고, unread 상태로 남겨 재시도 기회를 둔다.
    });
  }, [chatId, isMarkingChatRead, latestReadableMessageId, markChatRead, room]);

  function handleChageMessage(text: string) {
    setMessage(text);
    realtime.notifyTyping(Boolean(text.trim()));
  }

  async function handleSendMessage() {
    const trimmed = message.trim();
    if (!trimmed || !chatId) {
      return;
    }

    try {
      await sendMessageMutation.sendMessage(trimmed);
      realtime.notifyTyping(false);
      setMessage("");
    } catch {
      return Alert.alert("메시지 전송에 실패 했습니다");
    }
  }

  function renderMessageItem(item: TChatMessage) {
    return (
      <Message
        key={item.id}
        id={item.id}
        message={item.body}
        isOwn={item.authorId === currentUserId}
        author={item.author}
        createdAt={item.createdAt}
      />
    );
  }

  const messageSections = useMemo(() => {
    const sections: (
      | { type: "date"; key: string; label: string }
      | { type: "message"; key: string; item: TChatMessage }
    )[] = [];

    let previousDateKey: string | null = null;

    for (const item of messages) {
      const nextDateKey = dayjs(item.createdAt).format("YYYY-MM-DD");

      if (nextDateKey !== previousDateKey) {
        sections.push({
          type: "date",
          key: `date:${nextDateKey}`,
          label: formatChatDateLabel(item.createdAt),
        });
        previousDateKey = nextDateKey;
      }

      sections.push({
        type: "message",
        key: item.id,
        item,
      });
    }

    return sections;
  }, [messages]);

  const headerStatusLabel = isCounterpartOnline ? "실시간 연결됨" : "오프라인";

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-5 pt-4 border-b border-border pb-2">
          <View className="flex-row items-start justify-between gap-3">
            {counterpart && (
              <AppText className="font-semibold">
                {counterpart.nickname}
              </AppText>
            )}
            <Chip
              label={headerStatusLabel}
              className={cn(
                isCounterpartOnline
                  ? "border-active/30 bg-active/10 text-active"
                  : "border-border bg-bg text-muted"
              )}
            />
          </View>
        </View>
        {realtime.errorMessage ? (
          <View className="px-5 pb-3">
            <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-panel-solid px-3 py-2.5">
              <AppText className="flex-1 text-[13px] leading-5" tone="muted">
                {realtime.errorMessage}
              </AppText>
              {realtime.canRetry ? (
                <Button
                  onPress={realtime.retry}
                  size="sm"
                  variant="secondary"
                  style={styles.retryButton}
                >
                  재연결
                </Button>
              ) : null}
            </View>
          </View>
        ) : null}
        <View className="flex-1 px-3">
          {roomQuery.isLoading ? (
            <View className="px-5 py-5">
              <AppText className="text-[14px] leading-5" tone="muted">
                채팅방 정보를 불러오는 중입니다.
              </AppText>
            </View>
          ) : null}
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-4 py-2 pb-32"
            showsVerticalScrollIndicator={false}
          >
            {!messagesQuery.isLoading && messages.length === 0 && (
              <View className="px-5 py-6">
                <AppText className="text-center text-[15px] font-bold leading-6">
                  아직 대화가 없습니다
                </AppText>
              </View>
            )}
            {messageSections.map((entry) =>
              entry.type === "date" ? (
                <View
                  key={entry.key}
                  className="flex-row items-center justify-center py-1"
                >
                  <View className="rounded-full bg-bg px-3 py-1.5">
                    <AppText
                      className="text-[11px] font-extrabold uppercase tracking-[1px]"
                      tone="muted"
                    >
                      {entry.label}
                    </AppText>
                  </View>
                </View>
              ) : (
                renderMessageItem(entry.item)
              )
            )}
            {isCounterpartTyping && (
              <View className="flex-row items-center gap-2 rounded-full p-2 w-20 border border-border bg-panel-solid">
                <BouncingDots color="#ffffff" />
              </View>
            )}
          </ScrollView>
        </View>
        <View className="absolute bottom-0 right-0 left-0">
          <Input
            value={message}
            onChangeText={handleChageMessage}
            className="flex-1"
            fieldClassName="bg-panel-solid/70"
            inputClassName="text-md leading-5.5"
            placeholder="메시지 입력"
            editable={!sendMessageMutation.isPending}
            multiline
            rightIcon={
              <Button
                disabled={!message.trim()}
                loading={sendMessageMutation.isPending}
                onPress={() => {
                  void handleSendMessage();
                }}
                style={styles.sendButton}
              >
                {!sendMessageMutation.isPending && (
                  <Feather name="send" size={18} color="white" />
                )}
              </Button>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatChatDateLabel(createdAt: string) {
  const target = dayjs(createdAt);
  const today = dayjs();

  if (target.isSame(today, "day")) {
    return "오늘";
  }

  if (target.isSame(today.subtract(1, "day"), "day")) {
    return "어제";
  }

  return target.format("M월 D일 ddd");
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bikerMapTheme.colors.bg,
    paddingHorizontal: 12,
  },
  sendButton: {
    minHeight: 40,
    minWidth: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  retryButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
