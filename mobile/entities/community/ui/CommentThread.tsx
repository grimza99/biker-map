import { useState } from "react";
import { Alert, View } from "react-native";
import { bikerMapTheme, type CommunityComment } from "@package-shared/index";

import { useCreateCommentReply } from "../model";
import { CommentCard } from "./CommentCard";
import { Button, Input } from "@/components/common";
import { Feather } from "@expo/vector-icons";
import { useSession } from "@/features/session/model";

type CommentThreadProps = {
  comment: CommunityComment;
  postId: string;
  canReply: boolean;
};

export function CommentThread({
  comment,
  postId,
  canReply,
}: CommentThreadProps) {
  const [reply, setReply] = useState("");
  const [replyInputOpen, setReplyInputOpen] = useState(false);
  const replyMutation = useCreateCommentReply(postId, comment.id);
  const { status } = useSession();
  const isLoggedin = status === "authenticated";
  async function handleReplySubmit() {
    try {
      await replyMutation.mutateAsync(reply);
      setReplyInputOpen(false);
    } catch (error) {
      Alert.alert(
        "답글 작성 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
    }
  }

  return (
    <View className="gap-2.5 px-4">
      <CommentCard
        item={comment}
        disabled={!canReply}
        showReplyAction
        onReplyPress={() => setReplyInputOpen((prev) => !prev)}
        onReaction={() => {}}
      />

      {replyInputOpen && canReply && (
        <View className="pl-4 flex flex-row items-start gap-2">
          <Input
            placeholder={
              isLoggedin ? "답글을 입력하세요" : "로그인후 답글 입력 가능"
            }
            disabled={replyMutation.isPending}
            value={reply}
            onChange={(e) => setReply(e.nativeEvent.text)}
            className="flex-1"
          />
          <Button
            size="sm"
            style={{
              borderRadius: 16,
              backgroundColor: bikerMapTheme.colors.accent,
              paddingHorizontal: 1,
            }}
            onPress={handleReplySubmit}
          >
            <Feather name="send" size={16} color="white" />
          </Button>
        </View>
      )}
      {/* reply list 영역 */}
      {comment.replies.length > 0 && (
        <View className="gap-2.5 pl-4">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              item={reply}
              disabled={!canReply}
              onReaction={() => {}}
            />
          ))}
        </View>
      )}
    </View>
  );
}
