import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import type { CommunityComment, CommunityReply } from "@package-shared/index";

import { AppText, Button } from "@/components/common";
import { bikerMapTheme } from "@package-shared/index";
import { ReactionActionGroup } from "../../../widgets/ui/ReactionActionGroup";

type CommentActionBarProps = {
  item: CommunityComment | CommunityReply;
  disabled?: boolean;
  showReplyAction?: boolean; //reply는 false
  onReplyPress?: () => void;
};

export function CommentActionBar({
  item,
  disabled,
  showReplyAction = false,
  onReplyPress,
}: CommentActionBarProps) {
  return (
    <View className="flex-row flex-wrap items-center justify-between">
      <View className="flex-row items-center gap-2">
        {showReplyAction && (
          <>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              onPress={onReplyPress}
              leftIcon={
                <Feather
                  name="corner-down-right"
                  size={14}
                  color={bikerMapTheme.colors.muted}
                />
              }
            >
              <AppText className="text-sm">답글 달기</AppText>
            </Button>
            <View className="flex-row items-center gap-1">
              <Feather
                name="message-square"
                size={14}
                color={bikerMapTheme.colors.muted}
              />
              <AppText tone="muted" className="text-xs font-semibold">
                {"replyCount" in item ? item.replyCount : 0}
              </AppText>
            </View>
          </>
        )}
      </View>

      <ReactionActionGroup
        reactions={item.reactions}
        disabled={disabled}
        onToggle={() => {}}
      />
    </View>
  );
}
