import { AppText } from "@/components/common";
import { cn, ProfileIdentity } from "@/shared";
import { TChatParticipantProfile } from "@package-shared/index";
import { StyleSheet, View } from "react-native";
import dayjs from "@/shared/lib/day-js";

interface IMessageProps {
  id: string;
  message: string;
  isOwn: boolean;
  author: TChatParticipantProfile;
  createdAt: string;
}

export function Message({ message, isOwn, author, createdAt }: IMessageProps) {
  const timeLabel = dayjs(createdAt).format("A h:mm");

  return (
    <View className={cn("w-full flex", isOwn ? "items-end" : "items-start")}>
      <View
        className={cn(
          "flex flex-col gap-1.5",
          isOwn ? "items-end" : "items-start"
        )}
        style={styles.group}
      >
        {!isOwn && (
          <ProfileIdentity
            name={author.nickname}
            avatarUrl={author.avatarUrl ?? null}
          />
        )}
        <View className={cn("flex flex-row items-end gap-2")}>
          <View
            className={cn(
              "w-fit rounded-[22px] px-4 py-3",
              isOwn
                ? "bg-accent rounded-br-md"
                : "border border-border bg-panel-solid rounded-tl-md"
            )}
            style={styles.bubble}
          >
            <AppText className="text-[14px] leading-5.5">{message}</AppText>
          </View>
        </View>
        <AppText className="text-[10px] font-semibold" tone="muted">
          {timeLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    maxWidth: "82%",
  },
  bubble: {
    maxWidth: "100%",
    minWidth: 84,
  },
});
