import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import type {
  CommunityComment,
  CommunityReply,
  ReactionType,
} from "@package-shared/index";

import { AppText, Button } from "@/components/common";
import { bikerMapTheme } from "@package-shared/index";
import { ReactionActionGroup } from "../../../widgets/ui/ReactionActionGroup";

type CommentActionBarProps = {
  canManage?: boolean;
  isEditing?: boolean;
  item: CommunityComment | CommunityReply;
  disabled?: boolean;
  showReplyAction?: boolean; //reply는 false
  onDeletePress?: () => void;
  onEditPress?: () => void;
  onReplyPress?: () => void;
  onReaction?: (action: ReactionType) => void;
};

export function CommentActionBar({
  canManage = false,
  isEditing = false,
  item,
  disabled,
  showReplyAction = false,
  onDeletePress,
  onEditPress,
  onReplyPress,
  onReaction,
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
      <View className="flex-row items-center gap-1">
        {canManage && !isEditing ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              onPress={onEditPress}
              leftIcon={
                <Feather
                  name="edit-3"
                  size={14}
                  color={bikerMapTheme.colors.muted}
                />
              }
            >
              <AppText tone="muted" className="text-xs font-semibold">
                수정
              </AppText>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              onPress={onDeletePress}
              leftIcon={
                <Feather
                  name="trash-2"
                  size={14}
                  color={bikerMapTheme.colors.danger}
                />
              }
            >
              <AppText className="text-xs font-semibold text-danger">
                삭제
              </AppText>
            </Button>
          </>
        ) : null}

        <ReactionActionGroup
          reactions={item.reactions}
          disabled={disabled || isEditing}
          onToggle={(action) => onReaction?.(action)}
        />
      </View>
    </View>
  );
}
