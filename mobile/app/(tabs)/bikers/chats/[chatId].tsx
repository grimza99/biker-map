import { useLocalSearchParams } from "expo-router";

import { AppScreen } from "@/components/shell";

export default function BikerChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  return <AppScreen title={`채팅방 id : ${chatId}`}></AppScreen>;
}
