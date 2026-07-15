import { Feather } from "@expo/vector-icons";
import { bikerMapTheme } from "@package-shared/constants";
import { View } from "react-native";

import { AppText } from "./AppText";

export function MetaCounts({
  commentCount,
  viewCount,
}: {
  commentCount?: number;
  viewCount?: number;
}) {
  const hasCommentCount = typeof commentCount === "number";
  const hasViewCount = typeof viewCount === "number";

  if (!hasCommentCount && !hasViewCount) {
    return null;
  }
  return (
    <View className="flex-row items-center gap-4">
      {hasCommentCount && (
        <View className="flex-row items-center gap-1">
          <Feather
            name="message-square"
            size={16}
            color={bikerMapTheme.colors.text}
            style={{ color: bikerMapTheme.colors.text }}
          />
          <AppText tone="subtle" className="text-xs font-medium">
            {commentCount}
          </AppText>
        </View>
      )}
      {hasViewCount && (
        <View className="flex-row items-center gap-1">
          <Feather
            name="eye"
            size={16}
            color={bikerMapTheme.colors.text}
            style={{ color: bikerMapTheme.colors.text }}
          />
          <AppText tone="subtle" className="text-xs font-medium">
            {viewCount}
          </AppText>
        </View>
      )}
    </View>
  );
}
