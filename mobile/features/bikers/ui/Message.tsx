import { AppText } from "@/components/common";
import { cn } from "@/shared";
import type { BikerPreview } from "@/entities/bikers";
import { View } from "react-native";

interface IMessageProps {
  id: string;
  message: string;
  isOwn: boolean;
  author: BikerPreview;
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
        <AppText className="text-xs font-semibold" tone="muted">
          {author.nickname}
        </AppText>
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
