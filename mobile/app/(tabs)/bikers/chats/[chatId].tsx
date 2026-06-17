import { useLocalSearchParams } from "expo-router";

import { AppScreen } from "@/components/shell";
import { Message } from "@/features/bikers";
import { IBiker } from "@package-shared/types";
import { useId, useState } from "react";
import { Button, Input } from "@/components/common";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

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
    <AppScreen
      title={`채팅방 id : ${chatId}`}
      containerStyle={{ position: "relative" }}
    >
      <Message id={id} message="테스트1" isOwn={false} author={you} />
      <Message id={id} message="테스트1" isOwn author={me} />{" "}
      <View className="flex flex-row gap-2 fixed bottom-0 right-0 border-t border-t-border pt-2 bg-bg">
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
});
