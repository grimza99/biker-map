import { useLocalSearchParams } from "expo-router";

import { Message } from "@/features/bikers";
import { IBiker } from "@package-shared/types";
import { useId, useState } from "react";
import { Button, Input } from "@/components/common";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/common";

export default function BikerChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const [message, setMessage] = useState("");
  const id = useId();
  const me: IBiker = {
    nickname: "나",
    bikeBrand: "",
    bikeModel: "",
    distance: "",
    proficiency: "",
  };
  const you: IBiker = {
    nickname: "상대방",
    bikeBrand: "",
    bikeModel: "",
    distance: "",
    proficiency: "",
  };
  const handleChageMessage = (text: string) => {
    //todo : 웹소켓 연결, 입력중 이벤트 보내기
    setMessage(text);
  };

  const handleSendMessage = () => {
    //todo : 웹소켓 토픽 메시지 보내기
  };
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-5 pt-5"
      >
        <AppText className="text-[34px] font-extrabold leading-10">
          채팅방
        </AppText>
        <AppText className="text-[15px] leading-5.5" tone="muted">
          room: {chatId}
        </AppText>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-[18px] py-[18px]"
          showsVerticalScrollIndicator={false}
        >
          <Message id={id} message="테스트1" isOwn={false} author={you} />
          <Message id={id} message="테스트1" isOwn author={me} />
        </ScrollView>

        <View className="flex-row items-center gap-2 border-t border-border bg-bg py-3">
          <Input
            value={message}
            onChange={(e) => handleChageMessage(e.nativeEvent.text)}
            className="flex-1"
          />
          <Button onPress={handleSendMessage} style={styles.sendButton}>
            <Text>
              <Feather name="send" size={16} color="white" />
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sendButton: {
    borderRadius: 16,
    minHeight: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});
