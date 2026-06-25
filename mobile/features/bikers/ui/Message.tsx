import { AppText } from "@/components/common";
import { cn, ProfileIdentity } from "@/shared";
import { TChatParticipantProfile } from "@package-shared/index";
import { View } from "react-native";

interface IMessageProps {
  id: string;
  message: string;
  isOwn: boolean;
  author: TChatParticipantProfile;
}
export function Message({ message, isOwn, author }: IMessageProps) {
  return (
    <View className={cn("w-full flex", isOwn ? "items-end" : "items-start")}>
      <View
        className={cn(
          "flex flex-col gap-1",
          isOwn ? "items-end" : "items-start"
        )}
      >
        <ProfileIdentity
          name={author.nickname}
          avatarUrl={author.avatarUrl ?? null}
        />
        <View
          className={cn(
            "border border-none w-fit max-w-50 rounded-2xl py-1.5 px-3 min-w-30",
            isOwn ? "bg-accent" : "bg-border"
          )}
        >
          <AppText>{message}</AppText>
        </View>
      </View>
    </View>
  );
}
