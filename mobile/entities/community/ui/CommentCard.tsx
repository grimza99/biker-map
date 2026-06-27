import type {
  CommunityComment,
  CommunityReply,
  ReactionType,
} from "@package-shared/index";
import { View } from "react-native";

import { AppText, DefaultCardContainer } from "@/components/common";
import { ProfileIdentity } from "@/shared";
import { CommentActionBar } from "./CommentActionBar";

type CommentCardProps = {
  item: CommunityComment | CommunityReply;
  disabled?: boolean;
  showReplyAction?: boolean;
  onReplyPress?: () => void;
  onReaction?: (reaction: ReactionType) => void;
};

export function CommentCard({
  item,
  disabled,
  showReplyAction,
  onReplyPress,
  onReaction,
}: CommentCardProps) {
  return (
    <DefaultCardContainer containerStyle="gap-2 rounded-3xl bg-panel-solid px-3 py-2">
      <View className="flex-1 gap-1 flex-row items-center justify-between">
        <ProfileIdentity
          avatarUrl={item.author.avatarUrl}
          name={item.author.name}
        />
        <AppText tone="muted" className="pl-10 text-xs font-semibold">
          {item.timeLabel}
        </AppText>
      </View>
      <AppText className="leading-6.5">{item.content}</AppText>
      <CommentActionBar
        item={item}
        disabled={disabled}
        showReplyAction={showReplyAction}
        onReplyPress={onReplyPress}
        onReaction={(reaction) => onReaction?.(reaction)}
      />
    </DefaultCardContainer>
  );
}
