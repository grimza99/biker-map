import { useEffect, useState } from "react";
import type {
  CommunityComment,
  CommunityReply,
  ReactionType,
} from "@package-shared/index";
import { Alert, View } from "react-native";

import { AppText, Button, DefaultCardContainer, Input } from "@/components/common";
import { ProfileIdentity } from "@/shared";
import { CommentActionBar } from "./CommentActionBar";
import { bikerMapTheme } from "@package-shared/index";

type CommentCardProps = {
  canManage?: boolean;
  isMutating?: boolean;
  item: CommunityComment | CommunityReply;
  disabled?: boolean;
  onDelete?: () => Promise<void>;
  showReplyAction?: boolean;
  onUpdate?: (content: string) => Promise<void>;
  onReplyPress?: () => void;
  onReaction?: (reaction: ReactionType) => void;
};

export function CommentCard({
  canManage = false,
  isMutating = false,
  item,
  disabled,
  onDelete,
  showReplyAction,
  onUpdate,
  onReplyPress,
  onReaction,
}: CommentCardProps) {
  const [draftContent, setDraftContent] = useState(item.content);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setDraftContent(item.content);
  }, [item.content]);

  async function handleUpdate() {
    const nextContent = draftContent.trim();

    if (!nextContent) {
      Alert.alert("댓글 수정 실패", "내용을 입력해주세요.");
      return;
    }

    if (nextContent === item.content.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      await onUpdate?.(nextContent);
      setIsEditing(false);
    } catch (error) {
      Alert.alert(
        "댓글 수정 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
    }
  }

  function handleDelete() {
    if (!onDelete) {
      return;
    }

    Alert.alert(
      "댓글 삭제",
      "삭제한 댓글은 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            void onDelete().catch((error) => {
              Alert.alert(
                "댓글 삭제 실패",
                error instanceof Error ? error.message : "오류가 발생했습니다."
              );
            });
          },
        },
      ]
    );
  }

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

      {isEditing ? (
        <View className="gap-2">
          <Input
            multiline
            disabled={disabled || isMutating}
            value={draftContent}
            onChangeText={setDraftContent}
            placeholder="댓글 내용을 입력하세요"
          />
          <View className="flex-row justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={isMutating}
              onPress={() => {
                setDraftContent(item.content);
                setIsEditing(false);
              }}
            >
              취소
            </Button>
            <Button
              size="sm"
              disabled={isMutating}
              loading={isMutating}
              style={{ backgroundColor: bikerMapTheme.colors.accent }}
              onPress={() => {
                void handleUpdate();
              }}
            >
              저장
            </Button>
          </View>
        </View>
      ) : (
        <AppText className="leading-6.5">{item.content}</AppText>
      )}

      <CommentActionBar
        canManage={canManage}
        isEditing={isEditing}
        item={item}
        disabled={disabled || isMutating}
        onDeletePress={handleDelete}
        onEditPress={() => setIsEditing(true)}
        showReplyAction={showReplyAction}
        onReplyPress={onReplyPress}
        onReaction={(reaction) => onReaction?.(reaction)}
      />
    </DefaultCardContainer>
  );
}
