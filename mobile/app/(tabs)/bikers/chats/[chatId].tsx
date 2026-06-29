import { useMemo, useState } from "react";

import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { type TChatMessage } from "@package-shared/index";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AppScreen } from "@/components/shell";
import { AppText, Button, Input } from "@/components/common";
import {
  Message,
  useChatMessages,
  useChatRealtime,
  useChatRoom,
  useSendChatMessageMutation,
} from "@/features/bikers";
import { useSession } from "@/features/session/model";

export default function BikerChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const [message, setMessage] = useState("");
  const { user } = useSession();

  const roomQuery = useChatRoom(chatId ?? "");
  const messagesQuery = useChatMessages(chatId ?? "");
  const sendMessageMutation = useSendChatMessageMutation(chatId ?? "");
  const realtime = useChatRealtime(chatId ?? "", Boolean(chatId));

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

  const screenTitle =
    counterpart?.nickname ?? room?.participants[0]?.nickname ?? "채팅방";

  function handleChageMessage(text: string) {
    setMessage(text);
  }

  async function handleSendMessage() {
    const trimmed = message.trim();
    if (!trimmed || !chatId) {
      return;
    }

    try {
      await sendMessageMutation.sendMessage(trimmed);
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
      />
    );
  }

  return (
    <AppScreen title={screenTitle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-5 pt-5"
      >
        {roomQuery.isLoading ? (
          <AppText className="mt-3 text-[14px] leading-5" tone="muted">
            채팅방 정보를 불러오는 중입니다.
          </AppText>
        ) : null}
        {realtime.errorMessage ? (
          <View className="mt-3 flex-row items-center gap-2 rounded-2xl border border-border bg-panel-solid px-3 py-2">
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
        ) : null}

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-[18px] py-[18px]"
          showsVerticalScrollIndicator={false}
        >
          {!messagesQuery.isLoading && messages.length === 0 ? (
            <AppText className="text-[14px] leading-5" tone="muted">
              아직 대화가 없습니다. 첫 메시지를 보내 보세요.
            </AppText>
          ) : null}
          {messages.map(renderMessageItem)}
        </ScrollView>

        <View className="flex-row items-center gap-2 border-t border-border bg-bg py-3">
          <Input
            value={message}
            onChangeText={handleChageMessage}
            className="flex-1"
            placeholder="메시지를 입력하세요"
            editable={!sendMessageMutation.isPending}
          />
          <Button
            disabled={!message.trim()}
            loading={sendMessageMutation.isPending}
            onPress={() => {
              void handleSendMessage();
            }}
            style={styles.sendButton}
          >
            {!sendMessageMutation.isPending && (
              <Feather name="send" size={16} color="white" />
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sendButton: {
    borderRadius: 16,
    minHeight: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  retryButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
