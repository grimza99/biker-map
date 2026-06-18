import { View } from "react-native";
import type {
  CommunityComment,
  CommunityReply,
  ReactionType,
} from "@package-shared/index";

import { AppText, DefaultCardContainer } from "@/components/common";
import { CommentActionBar } from "./CommentActionBar";
import { ProfileIdentity } from "@/shared";

type CommentCardProps = {
  item: CommunityComment | CommunityReply;
  disabled?: boolean;
  showReplyAction?: boolean;
  onReplyPress?: () => void;
  onReaction?: (reaction: ReactionType) => void;
};

//todo : author의 avatarUrl 넘겨주기
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
        <ProfileIdentity avatarUrl={null} name={item.author.name} />
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
